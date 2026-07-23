from langchain_community.document_loaders import PyPDFLoader, Docx2txtLoader

def load_resume_documents(file_path: str):
    """
    Load resume and return list of LangChain Document objects.
    Supports PDF and DOCX.
    """
    if file_path.endswith(".pdf"):
        loader = PyPDFLoader(file_path)
    elif file_path.endswith(".docx"):
        loader = Docx2txtLoader(file_path)
    else:
        raise ValueError("Only PDF and DOCX supported")
    
    documents = loader.load()  # returns List[Document]
    return documents

def get_resume_text(file_path: str) -> str:
    """Get plain text from resume (useful for passing full context)."""
    docs = load_resume_documents(file_path)
    return "\n\n".join([doc.page_content for doc in docs]) 
