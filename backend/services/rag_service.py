from langchain_qdrant import QdrantVectorStore
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams
from config import QDRANT_URL, QDRANT_API_KEY
import logging

logger = logging.getLogger(__name__)

embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
VECTOR_SIZE = 384  # all-MiniLM-L6-v2 output dimension

client = QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)

def _ensure_collection(collection_name: str):
    """Create Qdrant collection if it doesn't already exist."""
    existing = [c.name for c in client.get_collections().collections]
    if collection_name not in existing:
        client.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE)
        )
        logger.info(f"Created Qdrant collection: {collection_name}")

def index_resume(session_id: str, documents: list):
    """Chunk, embed, and store resume documents in Qdrant Cloud."""
    collection_name = f"resume_{session_id}"
    _ensure_collection(collection_name)

    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_documents(documents)

    QdrantVectorStore.from_documents(
        chunks,
        embeddings,
        url=QDRANT_URL,
        api_key=QDRANT_API_KEY,
        collection_name=collection_name,
    )
    logger.info(f"Indexed {len(chunks)} chunks for session {session_id}")

def get_retriever(session_id: str):
    """Get a retriever for the session's Qdrant collection."""
    collection_name = f"resume_{session_id}"
    vectorstore = QdrantVectorStore(
        client=client,
        collection_name=collection_name,
        embedding=embeddings,
    )
    return vectorstore.as_retriever(search_kwargs={"k": 4})
