from fastapi import APIRouter, Query, HTTPException, Request
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorCollection
from typing import Optional, List
from pydantic import BaseModel
from bson import ObjectId

router = APIRouter(prefix="/doctors", tags=["Doctor Finding"])

# ─────────────────────────────────────────────
#  Price Range Map  (updated to match frontend)
# ─────────────────────────────────────────────
PRICE_RANGES = {
    "any":       (None, None),
    "0-1000":    (0,    1000),
    "1000-2000": (1000, 2000),
    "2000-3000": (2000, 3000),
    "3000-4000": (3000, 4000),
    "4000+":     (4000, None),
}

# ─────────────────────────────────────────────
#  Helper — typed Motor collection
# ─────────────────────────────────────────────
def get_collection(request: Request) -> AsyncIOMotorCollection:
    client: AsyncIOMotorClient = request.app.state.db_client
    return client["Doctor_record"]["Doctor_collection"]

# ─────────────────────────────────────────────
#  Response Model
# ─────────────────────────────────────────────
class DoctorOut(BaseModel):
    id: str
    name: str
    designation: str
    speciality: str
    city: str
    location: str
    fee: float
    availability: str

class SearchResponse(BaseModel):
    doctors: List[DoctorOut]
    message: str
    matched_on: str          # tells frontend which filters actually matched

def serialize(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

# ─────────────────────────────────────────────
#  Build fee filter dict from range string
# ─────────────────────────────────────────────
def build_fee_filter(fee: str) -> dict:
    min_fee, max_fee = PRICE_RANGES.get(fee.strip().lower(), (None, None))
    fee_filter = {}
    if min_fee is not None:
        fee_filter["$gte"] = min_fee
    if max_fee is not None:
        fee_filter["$lte"] = max_fee
    return fee_filter

# ─────────────────────────────────────────────
#  Run a query and return serialized results
# ─────────────────────────────────────────────
async def run_query(collection, query: dict, limit: int = 3) -> list:
    print(f"🔍 MongoDB Query: {query}")
    docs = await collection.find(query).sort("fee", 1).limit(limit).to_list(length=limit)
    return [serialize(doc) for doc in docs]

# ─────────────────────────────────────────────
#  SEARCH  —  GET /doctors/search
# ─────────────────────────────────────────────
@router.get("/search", response_model=SearchResponse)
async def search_doctors(
    request:      Request,
    specialty:    Optional[str] = Query(None, description="e.g. Dermatologist"),
    city:         Optional[str] = Query(None, description="e.g. Rawalpindi"),
    availability: Optional[str] = Query(None, description="anytime | morning | evening"),
    fee:          Optional[str] = Query(None, description="any | 0-1000 | 1000-2000 | 2000-3000 | 3000-4000 | 4000+"),
):
    collection = get_collection(request)

    # ── Normalise inputs ──────────────────────
    spec  = specialty.strip()    if specialty    else None
    city  = city.strip()         if city         else None
    avail = availability.strip().lower() if availability else None
    avail_val = None
    if avail == "morning":
        avail_val = "Morning"
    elif avail == "evening":
        avail_val = "Evening"
    # "anytime" or None → no availability filter

    fee_filter = build_fee_filter(fee) if fee and fee != "any" else {}

    # ══════════════════════════════════════════
    #  ATTEMPT 1 — Full match: specialty + city + availability + fee
    # ══════════════════════════════════════════
    query = {}
    if spec:       query["speciality"]   = {"$regex": spec, "$options": "i"}  # noqa: E701
    if city:       query["city"]         = {"$regex": city, "$options": "i"}  # noqa: E701
    if avail_val:  query["availability"] = avail_val  # noqa: E701
    if fee_filter: query["fee"]          = fee_filter  # noqa: E701

    docs = await run_query(collection, query)
    if docs:
        return {
            "doctors": docs,
            "message": f"Found {len(docs)} doctor(s) matching all your filters.",
            "matched_on": "specialty, city, availability, fee"
        }

    # ══════════════════════════════════════════
    #  ATTEMPT 2 — Flip availability (morning ↔ evening), keep fee
    #  e.g. "No doctors in the Morning at this price, here are Evening doctors"
    # ══════════════════════════════════════════
    if avail_val:
        flipped_avail = "Evening" if avail_val == "Morning" else "Morning"
        query2 = {}
        if spec:       query2["speciality"]   = {"$regex": spec, "$options": "i"}
        if city:       query2["city"]         = {"$regex": city, "$options": "i"}
        if fee_filter: query2["fee"]          = fee_filter
        query2["availability"] = flipped_avail

        docs = await run_query(collection, query2)
        if docs:
            return {
                "doctors": docs,
                "message": (
                    f"No {spec or 'doctors'} available in the {avail_val} at this price range in {city or 'your area'}. "
                    f"However, these doctors are available in the {flipped_avail}."
                ),
                "matched_on": f"specialty, city, fee — availability changed to {flipped_avail}"
            }

    # ══════════════════════════════════════════
    #  ATTEMPT 3 — Drop fee, keep specialty + city + availability
    #  e.g. "No doctors at that price, but here are some at other fees"
    # ══════════════════════════════════════════
    if fee_filter:
        query3 = {}
        if spec:      query3["speciality"]   = {"$regex": spec, "$options": "i"}
        if city:      query3["city"]         = {"$regex": city, "$options": "i"}
        if avail_val: query3["availability"] = avail_val

        docs = await run_query(collection, query3)
        if docs:
            return {
                "doctors": docs,
                "message": (
                    f"No {spec or 'doctors'} found within your selected fee range in {city or 'your area'}. "
                    f"Here are the closest matches at other fee ranges."
                ),
                "matched_on": "specialty, city, availability — fee filter removed"
            }

    # ══════════════════════════════════════════
    #  ATTEMPT 4 — Drop fee AND flip availability
    # ══════════════════════════════════════════
    if fee_filter and avail_val:
        flipped_avail = "Evening" if avail_val == "Morning" else "Morning"
        query4 = {}
        if spec:  query4["speciality"] = {"$regex": spec, "$options": "i"}
        if city:  query4["city"]       = {"$regex": city, "$options": "i"}
        query4["availability"] = flipped_avail

        docs = await run_query(collection, query4)
        if docs:
            return {
                "doctors": docs,
                "message": (
                    f"No {spec or 'doctors'} found in {avail_val} at your selected fee range. "
                    f"Here are {flipped_avail} doctors at other fee ranges."
                ),
                "matched_on": f"specialty, city — fee and availability adjusted"
            }

    # ══════════════════════════════════════════
    #  ATTEMPT 5 — Only specialty + city (broadest match)
    # ══════════════════════════════════════════
    query5 = {}
    if spec:  query5["speciality"] = {"$regex": spec, "$options": "i"}
    if city:  query5["city"]       = {"$regex": city, "$options": "i"}

    docs = await run_query(collection, query5)
    if docs:
        return {
            "doctors": docs,
            "message": (
                f"No exact match found for your filters. "
                f"Here are all available {spec or 'doctors'} in {city or 'your area'}."
            ),
            "matched_on": "specialty, city only"
        }

    # ══════════════════════════════════════════
    #  ATTEMPT 6 — Only specialty (city-wide search)
    # ══════════════════════════════════════════
    if spec:
        query6 = {"speciality": {"$regex": spec, "$options": "i"}}
        docs = await run_query(collection, query6)
        if docs:
            return {
                "doctors": docs,
                "message": (
                    f"No {spec} found in {city or 'your area'}. "
                    f"Here are {spec} doctors from nearby cities."
                ),
                "matched_on": "specialty only — city filter removed"
            }

    # ══════════════════════════════════════════
    #  ATTEMPT 7 — Nothing matched at all
    # ══════════════════════════════════════════
    raise HTTPException(
        status_code=404,
        detail=(
            f"No doctors found for '{spec or 'your search'}'. "
            "Please try a different specialty or broaden your filters."
        )
    )


# ─────────────────────────────────────────────
#  GET BY ID  —  GET /doctors/{id}
# ─────────────────────────────────────────────
@router.get("/{doctor_id}", response_model=DoctorOut)
async def get_doctor(doctor_id: str, request: Request):
    try:
        oid = ObjectId(doctor_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid doctor ID.")

    collection = get_collection(request)
    doc = await collection.find_one({"_id": oid})

    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found.")

    return serialize(doc)


# ─────────────────────────────────────────────
#  DEBUG  —  GET /doctors/debug
#  Remove before going to production
# ─────────────────────────────────────────────
@router.get("/debug", tags=["Debug"])
async def debug_all_doctors(request: Request):
    collection = get_collection(request)
    docs = await collection.find({}).to_list(length=100)
    for doc in docs:
        doc["_id"] = str(doc["_id"])
    return {"total_documents": len(docs), "doctors": docs}