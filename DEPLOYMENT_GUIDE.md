# Deployment Guide - Kerdos Trading LLC Economic AI Dashboard

## Quick Deployment Options

### Option 1: Replit (Recommended)
1. Upload all files to a new Replit project
2. Ensure Python 3.11+ environment
3. Install dependencies automatically via pyproject.toml
4. Set environment variables in Secrets tab:
   - `DATABASE_URL` (PostgreSQL connection string)
   - `ANTHROPIC_API_KEY` (optional, for AI features)
5. Run: `streamlit run app.py --server.port 5000`

### Option 2: Local Development
1. Clone/download project files
2. Install Python 3.11+
3. Install dependencies: `pip install -r DEPENDENCIES.txt`
4. Set up PostgreSQL database
5. Configure environment variables
6. Run: `streamlit run app.py`

### Option 3: Cloud Deployment (Heroku/AWS/GCP)
1. Use provided Dockerfile (create if needed)
2. Set environment variables in platform
3. Configure PostgreSQL addon/service
4. Deploy with web process: `streamlit run app.py --server.port $PORT`

## Environment Variables

### Required
```
DATABASE_URL=postgresql://user:password@host:port/database
```

### Optional
```
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

## Database Setup
The application will automatically create required tables on first run.

## Configuration Files

### Streamlit Config (.streamlit/config.toml)
```toml
[server]
headless = true
address = "0.0.0.0"
port = 5000
```

## Performance Considerations
- Dashboard auto-refreshes every 30 seconds
- Data caching: 5-30 minutes depending on data type
- PostgreSQL recommended for production
- Consider rate limiting for Yahoo Finance API

## Security Notes
- All API keys should be stored as environment variables
- Database connections use SSL by default
- No user authentication implemented (add if needed)

## Monitoring
- Check workflow logs for data fetch errors
- Monitor PostgreSQL connection health
- Track API rate limits (Yahoo Finance, Anthropic)

## Troubleshooting
- If bond data fails: Some symbols may be delisted (non-critical)
- If news feeds fail: Check RSS feed availability
- If AI assistant fails: Verify ANTHROPIC_API_KEY is set
- Database connection issues: Check DATABASE_URL format