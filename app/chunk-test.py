from langchain_community.document_loaders import JSONLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter

# The metadata function now receives the full dictionary
def metadata_func(record: dict, metadata: dict) -> dict:
    metadata["url"] = record.get("url")
    metadata["disease"] = record.get("disease")
    metadata["title"] = record.get("title")
    metadata['page_type'] = record.get("page_type")
    
    return metadata

loader = JSONLoader(
    file_path="data/pages.jsonl",
    jq_schema=".",           # Get the WHOLE record/dictionary
    content_key="full_text", # Tell it which key in that record is the text
    json_lines=True,
    metadata_func=metadata_func
)

docs = loader.load()



splitter = RecursiveCharacterTextSplitter(
    chunk_size = 1600,
    chunk_overlap = 200
)

results = splitter.split_documents(docs)

print(results[99].page_content)

print("**********************************************")

print(results[100].page_content)