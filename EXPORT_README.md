# Kerdos Trading LLC - Economic AI Dashboard Export Package

## Overview
This export contains a complete Streamlit-based Economic AI Dashboard with real-time financial data, sentiment analysis, and AI-powered insights for Kerdos Trading LLC.

## Files Included

### Core Application
- `app.py` - Main dashboard application with all features
- `.streamlit/config.toml` - Streamlit configuration
- `pyproject.toml` - Python dependencies
- `replit.md` - Project documentation and architecture

### Features
1. **Real-time Market Data**
   - NASDAQ stocks (AAPL, MSFT, GOOGL, AMZN, TSLA, META, NVDA, NFLX)
   - Commodity prices (Gold, Silver, Oil, Copper, Platinum)
   - Government bond yields (US, UK, Germany, Japan, Israel)
   - Economic indicators and currency pairs

2. **Historical Analysis & Sentiment**
   - 3, 6, 9, 12 month analysis periods
   - 4, 8, 12 year long-term analysis
   - TextBlob-powered sentiment analysis
   - Financial projection modeling
   - Market volatility analysis

3. **Global Intelligence**
   - Reuters and BBC news feeds
   - Conflict detection algorithms
   - Weather data framework
   - PostgreSQL database integration

4. **AI Assistant**
   - Anthropic Claude-powered chatbot
   - Market correlation analysis
   - Risk assessment capabilities
   - Custom variable suggestions

5. **Auto-refresh Functionality**
   - 30-second continuous updates
   - Real-time data synchronization
   - Persistent session management

## Installation & Setup

### Requirements
- Python 3.11+
- PostgreSQL database
- Streamlit
- All dependencies listed in pyproject.toml

### Environment Variables Required
- `DATABASE_URL` - PostgreSQL connection string
- `ANTHROPIC_API_KEY` - For AI assistant functionality (optional)

### Quick Start
```bash
# Install dependencies
pip install -r requirements.txt

# Run the dashboard
streamlit run app.py --server.port 5000
```

## Data Sources
- **Yahoo Finance** - Real-time stock and commodity data
- **Reuters RSS** - Global news feeds
- **BBC RSS** - International news
- **Government APIs** - Bond yield data (where available)

## Architecture
- **Frontend**: Streamlit with Plotly visualizations
- **Backend**: Python with async data fetching
- **Database**: PostgreSQL with SQLAlchemy ORM
- **AI**: Anthropic Claude for analysis
- **Caching**: 5-minute TTL for performance

## Deployment
Optimized for Replit platform but can run on any Python environment with proper dependencies.

## Last Updated
June 13, 2025

## Contact
Built for Kerdos Trading LLC's financial analysis needs with comprehensive real-time monitoring capabilities.