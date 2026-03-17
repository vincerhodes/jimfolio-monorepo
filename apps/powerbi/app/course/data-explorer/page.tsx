import Link from "next/link";
import Header from "@/components/Header";

export const metadata = { title: "Data Explorer | Power BI Course Datasets" };

const DownloadIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M8 12l-4-4h2.5V3h3v5H12L8 12z"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2h-1v2H3v-2H2z"/></svg>
);

export default function DataExplorerPage() {
  return (
    <>
      <Header
        title="Data Explorer"
        subtitle="Download datasets and view samples"
        activePage="data-explorer"
      />

      <main className="page-wrap">
        <section className="card hero-card" id="explorer-intro">
          <span className="pill">Dataset Reference</span>
          <h2 className="section-title">All Course Datasets</h2>
          <p>
            Browse all available datasets for the Power BI course. Each file includes a description,
            column information, and a small sample preview. Use the download buttons to get the files.
          </p>
          <div className="badge-row">
            <span className="badge yellow">Northwind: Clean data for Session 1</span>
            <span className="badge green">Dirty files for Power Query exercises</span>
          </div>
        </section>

        {/* NORTHWIND SECTION */}
        <div className="section-heading"><h2>Northwind Dataset (Clean)</h2></div>
        <p className="subtle">Classic sample database for learning data modeling and visualization. Use these files for Session 1 demos.</p>

        <div className="data-grid">
          <div className="data-card">
            <h3><span className="file-icon">CSV</span> customers.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">91 rows · 11 columns · Customer dimension table</div>
            <div className="description">Customer master data with contact information, addresses, and regional data. Use <strong>customerID</strong> to join with the orders table.</div>
            <div className="sample-table"><table><thead><tr><th>customerID</th><th>companyName</th><th>contactName</th><th>city</th><th>country</th></tr></thead><tbody>
              <tr><td>ALFKI</td><td>Alfreds Futterkiste</td><td>Maria Anders</td><td>Berlin</td><td>Germany</td></tr>
              <tr><td>ANATR</td><td>Ana Trujillo Emparedados</td><td>Ana Trujillo</td><td>México D.F.</td><td>Mexico</td></tr>
              <tr><td>ANTON</td><td>Antonio Moreno Taquería</td><td>Antonio Moreno</td><td>México D.F.</td><td>Mexico</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/customers.csv" download><DownloadIcon /> Download customers.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> products.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">77 rows · 10 columns · Product dimension table</div>
            <div className="description">Product catalog with pricing, stock levels, and supplier references. Use <strong>productID</strong> to join with order-details, <strong>categoryID</strong> to join with categories.</div>
            <div className="sample-table"><table><thead><tr><th>productID</th><th>productName</th><th>unitPrice</th><th>unitsInStock</th><th>categoryID</th></tr></thead><tbody>
              <tr><td>1</td><td>Chai</td><td>18.00</td><td>39</td><td>1</td></tr>
              <tr><td>2</td><td>Chang</td><td>19.00</td><td>17</td><td>1</td></tr>
              <tr><td>3</td><td>Aniseed Syrup</td><td>10.00</td><td>13</td><td>2</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/products.csv" download><DownloadIcon /> Download products.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> orders.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">830 rows · 14 columns · Order header fact table</div>
            <div className="description">Order headers with customer references, dates, and shipping information. Use <strong>orderID</strong> to join with order-details, <strong>customerID</strong> to join with customers.</div>
            <div className="sample-table"><table><thead><tr><th>orderID</th><th>customerID</th><th>orderDate</th><th>shipCity</th><th>shipCountry</th></tr></thead><tbody>
              <tr><td>10248</td><td>VINET</td><td>1996-07-04</td><td>Reims</td><td>France</td></tr>
              <tr><td>10249</td><td>TOMSP</td><td>1996-07-05</td><td>Münster</td><td>Germany</td></tr>
              <tr><td>10250</td><td>HANAR</td><td>1996-07-08</td><td>Rio de Janeiro</td><td>Brazil</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/orders.csv" download><DownloadIcon /> Download orders.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> order-details.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">2155 rows · 5 columns · Order line items fact table</div>
            <div className="description">Individual line items for each order with quantity, price, and discount. This is a junction table linking orders to products. Use <strong>orderID</strong> and <strong>productID</strong>.</div>
            <div className="sample-table"><table><thead><tr><th>orderID</th><th>productID</th><th>unitPrice</th><th>quantity</th><th>discount</th></tr></thead><tbody>
              <tr><td>10248</td><td>11</td><td>14.00</td><td>12</td><td>0.00</td></tr>
              <tr><td>10248</td><td>42</td><td>9.80</td><td>10</td><td>0.00</td></tr>
              <tr><td>10248</td><td>72</td><td>34.80</td><td>5</td><td>0.00</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/order-details.csv" download><DownloadIcon /> Download order-details.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> categories.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">8 rows · 4 columns · Category dimension table</div>
            <div className="description">Product category names and descriptions. Use <strong>categoryID</strong> to join with products table. Great for grouping products in visualizations.</div>
            <div className="sample-table"><table><thead><tr><th>categoryID</th><th>categoryName</th><th>description</th></tr></thead><tbody>
              <tr><td>1</td><td>Beverages</td><td>Soft drinks, coffees, teas...</td></tr>
              <tr><td>2</td><td>Condiments</td><td>Sweet and savory sauces...</td></tr>
              <tr><td>3</td><td>Confections</td><td>Desserts, candies...</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/categories.csv" download><DownloadIcon /> Download categories.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> employees.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">9 rows · 17 columns · Employee dimension table</div>
            <div className="description">Employee information including names, titles, hire dates, and contact details. Use <strong>employeeID</strong> to join with orders table to analyze by salesperson.</div>
            <div className="sample-table"><table><thead><tr><th>employeeID</th><th>lastName</th><th>firstName</th><th>title</th><th>hireDate</th></tr></thead><tbody>
              <tr><td>1</td><td>Davolio</td><td>Nancy</td><td>Sales Representative</td><td>1992-05-01</td></tr>
              <tr><td>2</td><td>Fuller</td><td>Andrew</td><td>Vice President, Sales</td><td>1992-08-14</td></tr>
              <tr><td>3</td><td>Leverling</td><td>Janet</td><td>Sales Representative</td><td>1992-04-01</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/employees.csv" download><DownloadIcon /> Download employees.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> shippers.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">3 rows · 3 columns · Shipper dimension table</div>
            <div className="description">Shipping company reference data. Use <strong>shipperID</strong> to analyze delivery methods. Small lookup table for enriching order data.</div>
            <div className="sample-table"><table><thead><tr><th>shipperID</th><th>companyName</th><th>phone</th></tr></thead><tbody>
              <tr><td>1</td><td>Speedy Express</td><td>(503) 555-9831</td></tr>
              <tr><td>2</td><td>United Package</td><td>(503) 555-3199</td></tr>
              <tr><td>3</td><td>Federal Shipping</td><td>(503) 555-9931</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/shippers.csv" download><DownloadIcon /> Download shippers.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> suppliers.csv <span className="clean-badge">CLEAN</span></h3>
            <div className="meta">29 rows · 12 columns · Supplier dimension table</div>
            <div className="description">Vendor and supplier contact information. Use <strong>supplierID</strong> to join with products. Useful for supply chain analysis and vendor performance reporting.</div>
            <div className="sample-table"><table><thead><tr><th>supplierID</th><th>companyName</th><th>contactName</th><th>country</th></tr></thead><tbody>
              <tr><td>1</td><td>Exotic Liquids</td><td>Charlotte Cooper</td><td>UK</td></tr>
              <tr><td>2</td><td>New Orleans Cajun Delights</td><td>Shelley Burke</td><td>USA</td></tr>
              <tr><td>3</td><td>Grandma Kelly&#39;s Homestead</td><td>Regina Murphy</td><td>USA</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/northwind/suppliers.csv" download><DownloadIcon /> Download suppliers.csv</a>
          </div>
        </div>

        {/* DIRTY DATA SECTION */}
        <div className="section-heading"><h2>Dirty Datasets (Power Query Exercises)</h2></div>
        <p className="subtle">These files contain intentional data quality issues for learning Power Query transformations. Use these files for Session 2 exercises.</p>

        <div className="data-grid">
          <div className="data-card">
            <h3><span className="file-icon">CSV</span> Employees_Dirty.csv <span className="dirty-badge">DIRTY</span></h3>
            <div className="meta">~500 rows · 5 columns · Power Query cleaning exercise</div>
            <div className="description"><strong>Issues:</strong> Header noise rows, inconsistent text casing, double spaces in names, mixed date formats (ISO, US, UK, written), N/A and PENDING as missing values, inconsistent department naming with numbers.</div>
            <div className="sample-table"><table><thead><tr><th>EmployeeID</th><th>FullName</th><th>Department</th><th>Salary</th><th>StartDate</th></tr></thead><tbody>
              <tr><td>E001</td><td>Laura  Williams</td><td>IT 216</td><td>(blank)</td><td>2019-12-29</td></tr>
              <tr><td>E003</td><td>SARAH JOHNSON</td><td>Procurement 407</td><td>42679</td><td>02/08/2022</td></tr>
              <tr><td>E004</td><td>JAMES  LEE</td><td>Admin 371</td><td>61795</td><td>20th August 2024</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/dirty/Employees_Dirty.csv" download><DownloadIcon /> Download Employees_Dirty.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> Sales_Dirty.csv <span className="dirty-badge">DIRTY</span></h3>
            <div className="meta">~500 rows · 7 columns · Power Query cleaning exercise</div>
            <div className="description"><strong>Issues:</strong> £ currency symbols in amounts, REFUND and TBC as invalid entries, mixed date formats, inconsistent casing (uppercase products), blank payment methods, inconsistent region names (south/North/EAST).</div>
            <div className="sample-table"><table><thead><tr><th>SaleID</th><th>EmployeeID</th><th>Product Sold</th><th>Sale Amount</th><th>Sale Date</th><th>Region</th></tr></thead><tbody>
              <tr><td>S0001</td><td>E136</td><td>Widget B</td><td>890.00</td><td>2024-08-23</td><td>south</td></tr>
              <tr><td>S0002</td><td>E920</td><td>TRAINING BUNDLE</td><td>780.00</td><td>10/04/2024</td><td>North</td></tr>
              <tr><td>S0003</td><td>E500</td><td>Implementation Support</td><td>£1650.00</td><td>25/10/2023</td><td>EAST</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/dirty/Sales_Dirty.csv" download><DownloadIcon /> Download Sales_Dirty.csv</a>
          </div>

          <div className="data-card">
            <h3><span className="file-icon">CSV</span> Departments_Dirty.csv <span className="dirty-badge">DIRTY</span></h3>
            <div className="meta">~10 rows · 3 columns · Power Query cleaning exercise</div>
            <div className="description"><strong>Issues:</strong> Extra header rows with report metadata, blank lines, irregular spacing. Demonstrates the &quot;Remove Top Rows&quot; and &quot;Promote Headers&quot; transforms needed for exported report data.</div>
            <div className="sample-table"><table><thead><tr><th>Department</th><th>Manager</th><th>Budget</th></tr></thead><tbody>
              <tr><td>(blank)</td><td>(blank)</td><td>(blank)</td></tr>
              <tr><td>(blank)</td><td>(blank)</td><td>(blank)</td></tr>
              <tr><td>Department Report</td><td>(blank)</td><td>(blank)</td></tr>
            </tbody></table></div>
            <a className="download-btn" href="/powerbi/datasets/dirty/Departments_Dirty.csv" download><DownloadIcon /> Download Departments_Dirty.csv</a>
          </div>
        </div>

        {/* DATA MODEL REFERENCE */}
        <section className="card" style={{ marginTop: "2rem" }}>
          <h2 className="section-title">Data Model Reference</h2>
          <p className="subtle">Recommended table relationships for the Northwind dataset in Power BI.</p>
          <div className="table-wrap" style={{ marginTop: "1rem" }}>
            <table>
              <thead><tr><th>From Table</th><th>Column</th><th>To Table</th><th>Column</th><th>Cardinality</th></tr></thead>
              <tbody>
                <tr><td>customers</td><td>customerID</td><td>orders</td><td>customerID</td><td>One-to-Many</td></tr>
                <tr><td>orders</td><td>orderID</td><td>order-details</td><td>orderID</td><td>One-to-Many</td></tr>
                <tr><td>products</td><td>productID</td><td>order-details</td><td>productID</td><td>One-to-Many</td></tr>
                <tr><td>categories</td><td>categoryID</td><td>products</td><td>categoryID</td><td>One-to-Many</td></tr>
                <tr><td>employees</td><td>employeeID</td><td>orders</td><td>employeeID</td><td>One-to-Many</td></tr>
                <tr><td>shippers</td><td>shipperID</td><td>orders</td><td>shipVia</td><td>One-to-Many</td></tr>
                <tr><td>suppliers</td><td>supplierID</td><td>products</td><td>supplierID</td><td>One-to-Many</td></tr>
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="footer-card">
          <strong>Data Explorer</strong> · Browse and download all course datasets · Back to <Link href="/course">Course Overview</Link>
        </div>
      </footer>
    </>
  );
}
