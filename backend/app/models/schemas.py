from pydantic import BaseModel


class UploadResponse(BaseModel):
    session_id: str
    file_count: int
    filenames: list[str]


class KeywordUploadResponse(BaseModel):
    session_id: str
    keyword_count: int
    keywords: list[str]


class KeywordsTextRequest(BaseModel):
    session_id: str
    keywords_text: str


class RenameRequest(BaseModel):
    session_id: str
    base_name: str


class RenamePreviewItem(BaseModel):
    original: str
    renamed: str


class RenamePreviewResponse(BaseModel):
    session_id: str
    preview: list[RenamePreviewItem]


class RenameResponse(BaseModel):
    session_id: str
    renamed_count: int
    results: list[RenamePreviewItem]
    errors: list[str]


class InjectRequest(BaseModel):
    session_id: str
    keywords: list[str] | None = None


class InjectResponse(BaseModel):
    session_id: str
    injected_count: int
    results: list[str]
    errors: list[str]
