FROM python:3.11-slim

WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
# Disable progress bar to avoid threading issues
ENV PIP_PROGRESS_BAR=off
RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port (will be overridden by Render's PORT env var)
EXPOSE 8000

# Run the application (use PORT env var from Render)
CMD uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}

