# PHANTOM — Development Commands

.PHONY: dev dev-backend dev-frontend docker-up docker-down

# Start all infrastructure
docker-up:
	docker compose up -d

docker-down:
	docker compose down

# Backend
dev-backend:
	cd backend && python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
dev-frontend:
	cd frontend && npm run dev

# Full dev (run in separate terminals)
dev:
	@echo "Run in separate terminals:"
	@echo "  make docker-up"
	@echo "  make dev-backend"
	@echo "  make dev-frontend"
