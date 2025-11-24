# Data Sources & Visualization Specifications
## Complete Data Catalog with Access Methods

---

## Overview

This document catalogs all publicly available data sources needed for the wealth inequality storytelling project, organized by visualization and narrative section.

**Data Quality Principles**:
- Prioritize official government and international organization sources
- Use peer-reviewed academic data where official data unavailable
- Ensure all data is downloadable in machine-readable formats (CSV, JSON, API)
- Document methodology and limitations
- Provide citation information for transparency

---

## Primary Data Sources

### 1. World Inequality Database (WID.world)

**URL**: https://wid.world/
**Coverage**: Global, 1900-present (varies by country)
**Format**: CSV download, API available
**License**: Open access

**Available Data**:
- Wealth share by percentile (top 10%, top 1%, bottom 50%)
- Income share by percentile
- Pre-tax and post-tax inequality
- Historical data back to 1900s for many countries

**Specific Datasets Needed**:
- UK wealth share top 10% (1945-2024)
- UK wealth share top 1% (1945-2024)
- UK wealth share bottom 50% (1945-2024)
- UK income inequality (Gini coefficient, 1945-2024)

**Access Method**:
```
1. Go to https://wid.world/data/
2. Select "United Kingdom"
3. Select indicator: "Net personal wealth"
4. Select percentiles: p90p100, p99p100, p0p50
5. Download as CSV
```

**API Example**:
```javascript
// WID.world API endpoint
https://wid.world/api/v1/data?countries=GB&indicators=wealth&years=1945-2024&percentiles=p90p100,p99p100,p0p50
```

---

### 2. Office for National Statistics (ONS)

**URL**: https://www.ons.gov.uk/
**Coverage**: UK, various time periods
**Format**: Excel, CSV
**License**: Open Government License

**Key Datasets**:

#### A. Wealth in Great Britain
- **Dataset**: "Total Wealth: Wealth in Great Britain"
- **URL**: https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/bulletins/totalwealthingreatbritain/latest
- **Frequency**: Biennial (every 2 years)
- **Coverage**: 2006-2022
- **Contains**: 
  - Wealth distribution by decile
  - Breakdown by wealth type (property, financial, pension, physical)
  - Regional breakdowns

#### B. Effects of Taxes and Benefits
- **Dataset**: "Effects of taxes and benefits on household income"
- **URL**: https://www.ons.gov.uk/peoplepopulationandcommunity/personalandhouseholdfinances/incomeandwealth/bulletins/theeffectsoftaxesandbenefitsonhouseholdincome/latest
- **Coverage**: 1977-present
- **Contains**:
  - Income inequality (Gini coefficient)
  - Income by quintile
  - Effects of redistribution

#### C. House Price Index
- **Dataset**: "UK House Price Index"
- **URL**: https://www.ons.gov.uk/economy/inflationandpriceindices/bulletins/housepriceindex/latest
- **Coverage**: 1968-present (some data), 1993-present (comprehensive)
- **Contains**:
  - Average house prices
  - Regional breakdowns
  - Annual growth rates

#### D. Average Weekly Earnings
- **Dataset**: "Average weekly earnings in Great Britain"
- **URL**: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/earningsandworkinghours
- **Coverage**: 1963-present
- **Contains**:
  - Average weekly earnings
  - Real terms (inflation-adjusted)
  - By sector

#### E. Labour Productivity
- **Dataset**: "Labour productivity"
- **URL**: https://www.ons.gov.uk/employmentandlabourmarket/peopleinwork/labourproductivity
- **Coverage**: 1971-present
- **Contains**:
  - Output per hour worked
  - Output per worker
  - By sector

---

### 3. Bank of England

**URL**: https://www.bankofengland.co.uk/
**Coverage**: UK monetary data
**Format**: CSV, Excel, API
**License**: Open

**Key Datasets**:

#### A. Quantitative Easing Data
- **Dataset**: "Asset Purchase Facility"
- **URL**: https://www.bankofengland.co.uk/markets/quantitative-easing
- **Coverage**: 2009-present
- **Contains**:
  - Total QE by period
  - Asset purchases breakdown
  - Timeline of QE programs

**QE Timeline**:
- QE1 (2009-2010): £200bn
- QE2 (2011-2012): £175bn
- QE3 (2016): £70bn
- QE4 (2020-2021): £450bn
- **Total**: £895bn

#### B. Money Supply Data
- **Dataset**: "Bankstats (Monetary and Financial Statistics)"
- **URL**: https://www.bankofengland.co.uk/statistics/tables
- **Coverage**: 1963-present
- **Contains**:
  - M0, M2, M4 money supply
  - Broad money growth
  - Credit aggregates

#### C. Interest Rates
- **Dataset**: "Bank Rate history"
- **URL**: https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate
- **Coverage**: 1694-present
- **Contains**:
  - Historical Bank Rate
  - Policy decisions timeline

---

### 4. OECD Data

**URL**: https://data.oecd.org/
**Coverage**: International comparisons
**Format**: CSV, API
**License**: Open

**Key Datasets**:

#### A. Income Inequality
- **Dataset**: "Income inequality (Gini coefficient)"
- **Coverage**: 1970s-present, varies by country
- **Contains**:
  - Gini coefficients for all OECD countries
  - Before and after taxes/transfers

#### B. Wealth Distribution
- **Dataset**: "Wealth distribution database"
- **Coverage**: 2000s-present
- **Contains**:
  - Wealth share by percentile
  - International comparisons

#### C. Tax Revenue
- **Dataset**: "Revenue Statistics"
- **Coverage**: 1965-present
- **Contains**:
  - Tax revenue by type
  - Tax rates over time
  - International comparisons

**API Example**:
```javascript
// OECD API for Gini coefficient
https://stats.oecd.org/restsdmx/sdmx.ashx/GetData/IDD/GBR.GINI/all?format=csv
```

---

### 5. International Monetary Fund (IMF)

**URL**: https://www.imf.org/en/Data
**Coverage**: Global economic data
**Format**: CSV, Excel, API
**License**: Open

**Key Datasets**:

#### A. World Economic Outlook Database
- **URL**: https://www.imf.org/en/Publications/WEO/weo-database/
- **Coverage**: 1980-present
- **Contains**:
  - GDP data
  - Inflation rates
  - Unemployment rates

#### B. Fiscal Monitor
- **Coverage**: Government finance data
- **Contains**:
  - Government debt
  - Deficits
  - Revenue and expenditure

---

### 6. Federal Reserve Economic Data (FRED)

**URL**: https://fred.stlouisfed.org/
**Coverage**: Primarily US, some international
**Format**: CSV, API
**License**: Open

**Useful for**:
- US comparison data
- Stock market indices (S&P 500)
- International economic indicators

**API**: Excellent, well-documented
```javascript
// Example: S&P 500 data
https://api.stlouisfed.org/fred/series/observations?series_id=SP500&api_key=YOUR_KEY&file_type=json
```

---

### 7. Nationwide & Halifax House Price Indices

**Nationwide**: https://www.nationwide.co.uk/about/house-price-index/
**Halifax**: https://www.halifax.co.uk/media-centre/house-price-index/

**Coverage**: 1952-present (Nationwide), 1983-present (Halifax)
**Format**: Excel, PDF (requires extraction)
**Contains**:
- Monthly house price data
- Regional breakdowns
- Historical averages

**Note**: Nationwide has longest historical data, essential for post-war comparison

---

### 8. Trade Union Congress (TUC)

**URL**: https://www.tuc.org.uk/research-analysis/reports
**Coverage**: UK labor statistics
**Format**: Reports (PDF), some datasets

**Key Data**:
- Union membership rates (1970-present)
- Union density by sector
- Collective bargaining coverage

**Historical Union Membership**:
- 1979: 13.2 million members (55% density)
- 2000: 7.8 million members (29% density)
- 2023: 6.4 million members (23% density)

---

### 9. Resolution Foundation

**URL**: https://www.resolutionfoundation.org/
**Coverage**: UK living standards, inequality
**Format**: Reports with data appendices, some datasets

**Key Reports**:
- "The Living Standards Audit" (annual)
- "Intergenerational Commission" (generational wealth)
- "Low Pay Britain" (wage data)

**Useful Data**:
- Real wage growth
- Living standards by generation
- Housing affordability metrics

---

### 10. Institute for Fiscal Studies (IFS)

**URL**: https://ifs.org.uk/
**Coverage**: UK tax, benefits, inequality
**Format**: Reports, working papers, some datasets

**Key Resources**:
- "Living Standards, Inequality and Poverty in the UK" (annual)
- Tax and benefit microsimulation data
- Distributional analysis

---

### 11. Oxfam Inequality Reports

**URL**: https://www.oxfam.org/en/research
**Coverage**: Global inequality
**Format**: Reports with data

**Key Reports**:
- "Survival of the Richest" (2023)
- "Inequality Kills" (2022)
- Annual Davos reports

**Useful Data**:
- Billionaire wealth growth
- Wealth concentration statistics
- COVID-era wealth transfers

---

### 12. Credit Suisse / UBS Global Wealth Report

**URL**: https://www.ubs.com/global/en/family-office-uhnw/reports/global-wealth-report.html
**Coverage**: Global wealth distribution
**Frequency**: Annual
**Format**: PDF report with data appendices

**Contains**:
- Wealth distribution by country
- Wealth per adult
- Wealth inequality metrics
- Historical trends

---

## Data by Visualization

### Visualization 1: Post-War Economic Growth (1945-1971)

**Chart Type**: Multi-line chart
**Data Needed**:
- GDP growth (annual %)
- Average wages (real terms)
- Labor productivity (output per hour)

**Sources**:
- GDP: ONS, IMF WEO
- Wages: ONS Average Weekly Earnings (inflation-adjusted)
- Productivity: ONS Labour Productivity

**Data Processing**:
- Normalize all to 1945 = 100 for comparison
- Inflation-adjust using ONS CPI data
- Annual data points

**Estimated Data Points**: ~26 years × 3 metrics = 78 points

---

### Visualization 2: The Great Divergence (1971-2024)

**Chart Type**: Dual-axis line chart
**Data Needed**:
- Labor productivity index (1971 = 100)
- Real wages index (1971 = 100)

**Sources**:
- Productivity: ONS Labour Productivity
- Wages: ONS Average Weekly Earnings (real terms)

**Key Insight**: Show the gap opening between productivity and wages

**Estimated Data Points**: ~53 years × 2 metrics = 106 points

---

### Visualization 3: House Price to Income Ratio (1970-2024)

**Chart Type**: Line chart with annotations
**Data Needed**:
- Average house price (annual)
- Average annual income (annual)
- Ratio calculation

**Sources**:
- House prices: Nationwide HPI, ONS HPI
- Income: ONS Average Weekly Earnings × 52

**Annotations**:
- 1971: End of Bretton Woods
- 1980: Thatcher elected
- 1997: New Labour
- 2008: Financial crisis
- 2020: COVID

**Estimated Data Points**: ~54 years

---

### Visualization 4: Wealth Share Over Time (1980-2024)

**Chart Type**: Stacked area chart or animated bar chart
**Data Needed**:
- Top 10% wealth share
- Top 1% wealth share
- Bottom 50% wealth share
- Middle 40% (calculated)

**Sources**:
- WID.world (primary)
- ONS Wealth in Great Britain (2006-2024 for validation)

**Animation**: Show wealth flowing upward over time

**Estimated Data Points**: ~44 years × 4 groups = 176 points

---

### Visualization 5: Top Tax Rate Decline (1945-2024)

**Chart Type**: Line chart
**Data Needed**:
- Top marginal income tax rate by year

**Sources**:
- HMRC historical tax rates
- IFS tax data
- OECD tax database

**Key Moments**:
- 1945-1979: 83-98% top rate
- 1979: Thatcher cuts to 60%
- 1988: Cut to 40%
- 2010: 50% (temporary)
- 2013: 45% (current)

**Estimated Data Points**: ~79 years

---

### Visualization 6: Union Membership Decline (1970-2024)

**Chart Type**: Line chart
**Data Needed**:
- Union membership (millions)
- Union density (% of workforce)

**Sources**:
- TUC statistics
- ONS Trade Union Membership
- Department for Business and Trade

**Estimated Data Points**: ~54 years × 2 metrics = 108 points

---

### Visualization 7: QE Timeline & Money Supply (2008-2024)

**Chart Type**: Combination - bar chart (QE programs) + line chart (M4 money supply)
**Data Needed**:
- QE program amounts by date
- M4 broad money supply (monthly or quarterly)

**Sources**:
- Bank of England QE data
- Bank of England Bankstats (M4)

**QE Programs to Visualize**:
- March 2009: £75bn
- May 2009: +£50bn
- August 2009: +£50bn
- November 2009: +£25bn
- October 2011: £75bn
- February 2012: +£50bn
- July 2012: +£50bn
- August 2016: £60bn + £10bn corporate bonds
- March 2020: £200bn
- June 2020: +£100bn
- November 2020: +£150bn

**Estimated Data Points**: 11 QE events + ~192 months of M4 data

---

### Visualization 8: Asset Prices vs Wages (2008-2024)

**Chart Type**: Multi-line chart (indexed)
**Data Needed**:
- FTSE 100 index
- Average house price
- Median wage
- All indexed to 2008 = 100

**Sources**:
- FTSE 100: Yahoo Finance, FRED
- House prices: ONS HPI
- Wages: ONS Average Weekly Earnings (median)

**Key Insight**: Show assets recovering and soaring while wages stagnate

**Estimated Data Points**: ~16 years × 3 metrics = 48 points (annual)

---

### Visualization 9: Billionaire Wealth Growth (2020-2024)

**Chart Type**: Bar chart or dramatic number counter
**Data Needed**:
- UK billionaire total wealth (2020 vs 2024)
- Number of billionaires (2020 vs 2024)
- Wealth increase in £ and %

**Sources**:
- Sunday Times Rich List
- Oxfam reports
- UBS Global Wealth Report

**Key Statistics**:
- 2020: 147 billionaires, ~£500bn total wealth
- 2024: 177 billionaires, ~£684bn total wealth
- Increase: £184bn (+37%)

---

### Visualization 10: Asset Ownership by Wealth Percentile

**Chart Type**: Stacked bar chart or treemap
**Data Needed**:
- Financial asset ownership by wealth decile
- Property ownership by wealth decile
- Pension wealth by wealth decile

**Sources**:
- ONS Wealth in Great Britain
- WID.world

**Key Insight**: Top 10% own ~70% of financial assets

---

### Visualization 11: Inflation Impact (2020-2024)

**Chart Type**: Line chart
**Data Needed**:
- CPI inflation rate (monthly)
- Real wage growth (monthly)

**Sources**:
- ONS CPI
- ONS Average Weekly Earnings (real terms)

**Key Insight**: Real wages falling during high inflation period

**Estimated Data Points**: ~48 months × 2 metrics = 96 points

---

### Visualization 12: Asset Competition Mechanism

**Chart Type**: Animated diagram/infographic
**Data Needed**: Conceptual, not data-driven
**Elements**:
- Wealthy individuals (icons)
- Limited assets (houses, stocks)
- Price arrows going up
- Feedback loop visualization

**Implementation**: Custom D3.js animation or Framer Motion

---

### Visualization 13: QE Money Flow Diagram

**Chart Type**: Sankey diagram or animated flow
**Data Needed**: Conceptual with approximate proportions
**Flow**:
1. Bank of England → £450bn created
2. → Financial institutions (bond purchases)
3. → Asset purchases (stocks, property)
4. → Asset price increases
5. → Wealth increase for asset owners

**Implementation**: D3.js Sankey or custom animation

---

### Visualization 14: Years to Save for House Deposit

**Chart Type**: Comparison bars
**Data Needed**:
- Average house price (1980, 2024)
- Average wage (1980, 2024)
- Typical deposit % (20%)
- Typical savings rate (10% of income)

**Calculation**:
```
Years = (House Price × 0.20) / (Annual Wage × 0.10)

1980: (£23,000 × 0.20) / (£6,000 × 0.10) = 7.7 years
2024: (£290,000 × 0.20) / (£35,000 × 0.10) = 16.6 years
```

**Sources**:
- House prices: Nationwide HPI
- Wages: ONS

---

### Visualization 15: Generational Wealth Comparison

**Chart Type**: Grouped bar chart
**Data Needed**:
- Wealth share by generation at age 35
  - Baby Boomers (born ~1956, age 35 in 1991)
  - Gen X (born ~1971, age 35 in 2006)
  - Millennials (born ~1986, age 35 in 2021)

**Sources**:
- Resolution Foundation Intergenerational Commission
- IFS generational analysis
- WID.world

**Key Statistics**:
- Boomers at 35: 21% of national wealth
- Gen X at 35: 11% of national wealth
- Millennials at 35: 4.8% of national wealth

---

### Visualization 16: Social Mobility Index

**Chart Type**: Line chart or ranking visualization
**Data Needed**:
- UK social mobility ranking over time
- Comparison with other countries

**Sources**:
- World Economic Forum Global Social Mobility Index
- OECD social mobility data
- Social Mobility Commission (UK)

---

### Visualization 17: Wealth Tax Brackets

**Chart Type**: Stepped bar chart or table
**Data**: Proposed wealth tax structure
```
£0 - £10m: 0%
£10m - £50m: 1%
£50m - £100m: 2%
£100m+: 3%
```

**Examples**:
- £5m wealth: £0 tax
- £20m wealth: £100k tax (1% on £10m above threshold)
- £200m wealth: £4m tax

---

### Visualization 18: Wealth Tax Revenue Projection

**Chart Type**: Bar chart
**Data Needed**:
- Number of people in each wealth bracket
- Estimated revenue by bracket
- Total revenue

**Sources**:
- ONS Wealth in Great Britain
- Sunday Times Rich List
- Wealth Tax Commission estimates

**Estimated Revenue**:
- 1% above £10m: ~£10bn/year
- 2% above £5m: ~£25bn/year
- Progressive structure: ~£15bn/year

---

### Visualization 19: International Wealth Tax Comparison

**Chart Type**: Map or country comparison cards
**Data Needed**:
- Countries with wealth tax
- Tax rates and thresholds
- Revenue as % of GDP

**Countries**:
- **Norway**: 0.95% above ~£150k, raises ~1% GDP
- **Switzerland**: Varies by canton, 0.3-1%, raises ~1% GDP
- **Spain**: 0.2-3.5% above €700k, raises ~0.15% GDP
- **France** (historical): 0.5-1.5%, repealed 2018

**Sources**:
- OECD tax database
- Wealth Tax Commission
- Individual country tax authorities

---

### Visualization 20: "Will They Leave?" Migration Data

**Chart Type**: Line chart or before/after comparison
**Data Needed**:
- Millionaire migration from Norway (2000-2024)
- Millionaire migration from Switzerland (2000-2024)
- Millionaire migration from France (2000-2024)

**Sources**:
- Academic papers on wealth tax migration
- National statistics offices
- Henley & Partners wealth migration reports

**Key Finding**: Some migration, but minimal compared to total wealthy population

---

### Visualization 21: Two Futures Projection

**Chart Type**: Split-screen projection chart
**Data Needed**:
- Current inequality trajectory (extrapolated)
- Projected inequality with wealth tax

**Scenarios**:
**Without Wealth Tax (2024-2045)**:
- Top 1% wealth share: 23% → 30%+
- Homeownership rate: 65% → 50%
- Public debt: Current → +50%

**With Wealth Tax (2024-2045)**:
- Top 1% wealth share: 23% → 18%
- Additional revenue: £15bn/year × 20 years = £300bn
- Public services: Funded, improved

**Sources**: Projection models based on current trends

---

## Data Processing & Preparation

### Tools Needed
- **Python** (pandas, numpy) for data cleaning
- **Excel/Google Sheets** for initial exploration
- **D3.js** for visualization
- **Git** for version control of datasets

### Data Pipeline
```
1. Download raw data from sources
2. Clean and standardize (Python/pandas)
3. Validate against multiple sources
4. Export to JSON for web use
5. Document methodology
6. Version control
```

### Data Storage Structure
```
/data
  /raw
    /ons
    /wid
    /boe
    /oecd
  /processed
    /timeseries
    /comparisons
    /projections
  /visualizations
    viz-01-postwar-growth.json
    viz-02-great-divergence.json
    ...
```

### Example Data Format (JSON)
```json
{
  "visualization_id": "viz-02-great-divergence",
  "title": "Productivity vs Wages (1971-2024)",
  "description": "Shows the divergence between productivity and real wages",
  "sources": [
    {
      "name": "ONS Labour Productivity",
      "url": "https://www.ons.gov.uk/...",
      "accessed": "2024-11-24"
    }
  ],
  "data": [
    {
      "year": 1971,
      "productivity_index": 100,
      "wage_index": 100
    },
    {
      "year": 1972,
      "productivity_index": 103.2,
      "wage_index": 102.8
    }
    // ... more data points
  ],
  "metadata": {
    "base_year": 1971,
    "inflation_adjusted": true,
    "currency": "GBP",
    "last_updated": "2024-11-24"
  }
}
```

---

## Data Validation Checklist

For each dataset:
- [ ] Source is authoritative and reputable
- [ ] Methodology is documented
- [ ] Data is publicly accessible
- [ ] License allows use
- [ ] Data is in machine-readable format
- [ ] Time series is complete (or gaps documented)
- [ ] Cross-validated with secondary source where possible
- [ ] Citation information included
- [ ] Last updated date recorded

---

## Data Limitations & Caveats

### Historical Data Gaps
- Pre-1970 data is less comprehensive
- Some metrics (e.g., wealth distribution) only available from 1980s
- Methodology changes over time may affect comparability

### Wealth Data Challenges
- Wealth is harder to measure than income
- Top wealth often underestimated (offshore, trusts, etc.)
- Different sources use different methodologies

### International Comparisons
- Definitions vary by country
- Data availability varies
- Exchange rate considerations

### Projections
- All future projections are estimates
- Based on current trends continuing
- Should be clearly labeled as projections, not predictions

---

## Update Schedule

**Regular Updates Needed**:
- ONS data: Quarterly/Annual releases
- WID.world: Annual updates
- Bank of England: Monthly/Quarterly
- House prices: Monthly

**Maintenance Plan**:
- Check for data updates: Monthly
- Refresh visualizations: Quarterly
- Full data audit: Annually

---

## Data Ethics & Transparency

**Principles**:
1. **Cite all sources** clearly and prominently
2. **Document methodology** for all calculations
3. **Acknowledge limitations** and uncertainties
4. **Provide raw data** links for verification
5. **Avoid cherry-picking** data to support narrative
6. **Present context** for all statistics
7. **Distinguish** between data and interpretation

**Transparency Measures**:
- Include "Data Sources" page on website
- Link to raw datasets
- Explain all calculations
- Provide download links for processed data
- Invite corrections and feedback

---

## Next Steps

1. **Download all primary datasets** (1-2 weeks)
2. **Clean and standardize data** (1 week)
3. **Validate cross-source** (3-4 days)
4. **Create JSON exports** for visualizations (3-4 days)
5. **Document methodology** (2-3 days)
6. **Set up update pipeline** (2-3 days)

**Total Data Preparation Time**: ~3-4 weeks

---

## Resources & Tools

**Data Analysis**:
- Python (pandas, numpy, matplotlib)
- Jupyter Notebooks for exploration
- Excel/Google Sheets for quick checks

**Data Visualization**:
- D3.js (primary)
- Chart.js (backup for simple charts)
- Observable (for prototyping)

**Data Storage**:
- GitHub for version control
- JSON files for web delivery
- CSV for archival/backup

**Documentation**:
- Markdown for methodology docs
- README files for each dataset
- Changelog for updates
