from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.exceptions import StockPilotException
from app.modules.auth.auth_router import router as auth_router
from app.modules.categories.category_router import router as categories_router
from app.modules.dashboard.dashboard_router import router as dashboard_router
from app.modules.products.product_router import router as products_router
from app.modules.stock_intelligence.stock_intelligence_router import (
    router as stock_intelligence_router,
)
from app.modules.stock_movements.stock_movement_router import (
    router as stock_movements_router,
)
from app.modules.suppliers.supplier_router import router as suppliers_router

app = FastAPI(title="StockPilot API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(StockPilotException)
async def stockpilot_exception_handler(
    request: Request,
    exc: StockPilotException,
):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "message": exc.message,
        },
    )


app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(suppliers_router)
app.include_router(products_router)
app.include_router(stock_movements_router)
app.include_router(dashboard_router)
app.include_router(stock_intelligence_router)


@app.get("/")
def root():
    return {"message": "StockPilot API is running"}


