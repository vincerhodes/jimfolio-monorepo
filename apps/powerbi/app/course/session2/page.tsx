import Link from "next/link";
import Header from "@/components/Header";
import Accordion from "@/components/Accordion";
import Tabs from "@/components/Tabs";
import CopyButton from "@/components/CopyButton";
import ProgressCheckbox from "@/components/ProgressCheckbox";

export const metadata = { title: "Session 2 | DAX, Power Query & Analysis" };

const daxLineTotal = `LineTotal =
RELATED(products[unitPrice]) * order-details[quantity] * (1 - order-details[discount])`;
const daxTotalSales = `Total Sales = SUM(order-details[LineTotal])`;
const daxTotalOrders = `Total Orders = DISTINCTCOUNT(orders[orderID])`;
const daxAvgOrder = `Avg Order Value = DIVIDE([Total Sales], [Total Orders], 0)`;
const daxCustomerCount = `Customer Count = DISTINCTCOUNT(orders[customerID])`;
const daxBeveragesSales = `Beverages Sales =
CALCULATE(
    [Total Sales],
    categories[categoryName] = "Beverages"
)`;
const daxGermanySales = `Germany Sales =
CALCULATE(
    [Total Sales],
    customers[country] = "Germany"
)`;

export default function Session2Page() {
  return (
    <>
      <Header
        title="Session 2: DAX, Power Query & Analysis"
        subtitle="2 hours · Hands-on formulas, cleaning, and report analysis"
        activePage="session2"
      />

      <main className="page-wrap">
        <section className="card hero-card" id="s2-intro">
          <span className="pill">Session 2 Focus</span>
          <h2 className="section-title">From basic calculations to cleaner data</h2>
          <p>
            Session 2 introduces beginner DAX measures, Power Query transformations, and practical analysis features
            used by business teams in day-to-day reporting.
          </p>
          <div className="note warning">
            <p>
              Expectation reminder: this course is an introduction to get learners started, not advanced mastery.
              For comprehensive learning, the <a href="https://www.datacamp.com/tracks/power-bi-fundamentals">DataCamp Power BI Fundamentals Track</a> (17 hours)
              provides complete coverage beyond these two sessions.
            </p>
          </div>
          <div className="btn-row">
            <Link className="button ghost" href="/course#prerequisites">Review prerequisite links</Link>
            <Link className="button primary" href="/course/session1">Back to Session 1</Link>
          </div>
          <ProgressCheckbox sectionId="s2-intro" />
        </section>

        <section className="card" id="s2-dax">
          <h2 className="section-title">Part 1: Basic DAX Measures</h2>
          <p>
            Use this section as a live demo. Each formula includes a copy button so learners can paste directly into Power BI.
          </p>
          <Accordion single openFirst items={[
            { title: "Step 1: Calculated column example", children: (
              <>
                <p>Create a calculated column in order-details to get line totals using the related products table:</p>
                <div className="code-sample">
                  <pre className="code-block">{daxLineTotal}</pre>
                  <CopyButton text={daxLineTotal} />
                </div>
              </>
            )},
            { title: "Step 2: Core measures", children: (
              <>
                <div className="code-sample"><pre className="code-block">{daxTotalSales}</pre><CopyButton text={daxTotalSales} /></div>
                <div className="code-sample"><pre className="code-block">{daxTotalOrders}</pre><CopyButton text={daxTotalOrders} /></div>
                <div className="code-sample"><pre className="code-block">{daxAvgOrder}</pre><CopyButton text={daxAvgOrder} /></div>
                <div className="code-sample"><pre className="code-block">{daxCustomerCount}</pre><CopyButton text={daxCustomerCount} /></div>
              </>
            )},
            { title: "Step 3: CALCULATE examples", children: (
              <>
                <div className="code-sample"><pre className="code-block">{daxBeveragesSales}</pre><CopyButton text={daxBeveragesSales} /></div>
                <div className="code-sample"><pre className="code-block">{daxGermanySales}</pre><CopyButton text={daxGermanySales} /></div>
              </>
            )},
          ]} />
          <div className="note info">
            <p><strong>Talking point:</strong> use measures for dynamic report totals and calculated columns for row-level logic.</p>
          </div>
          <ProgressCheckbox sectionId="s2-dax" />
        </section>

        <section className="card" id="s2-powerquery">
          <h2 className="section-title">Part 2: Power Query Transforms (Beginner)</h2>
          <p className="subtle">
            Open dirty CSV files via <strong>Transform Data</strong> and run these guided clean-up blocks.
          </p>
          <div className="btn-row" style={{ marginBottom: "1rem" }}>
            <a className="button primary" href="/powerbi/datasets/dirty/Employees_Dirty.csv" download>Employees_Dirty.csv</a>
            <a className="button primary" href="/powerbi/datasets/dirty/Sales_Dirty.csv" download>Sales_Dirty.csv</a>
            <a className="button primary" href="/powerbi/datasets/dirty/Departments_Dirty.csv" download>Departments_Dirty.csv</a>
          </div>
          <Accordion single openFirst items={[
            { title: "Employees_Dirty.csv clean-up", children: (
              <ol>
                <li>Remove top rows (title rows + blank rows).</li>
                <li>Use first row as headers.</li>
                <li>Set data types: Salary = Whole Number, StartDate = Date.</li>
                <li>Text functions: Capitalize each word, Trim, Replace double spaces.</li>
                <li>Replace invalid values: N/A and PENDING to null.</li>
              </ol>
            )},
            { title: "Sales_Dirty.csv clean-up", children: (
              <ol>
                <li>Remove top rows and promote headers.</li>
                <li>Replace &quot;£&quot; symbol in Sale Amount and set Decimal Number type.</li>
                <li>Replace invalid entries (REFUND, TBC) with null.</li>
                <li>Normalize text casing for Product Sold, Payment Method, and Region.</li>
                <li>Demonstrate Fill Down on suitable missing fields.</li>
              </ol>
            )},
            { title: "Departments_Dirty.csv and model join", children: (
              <ol>
                <li>Remove top noise rows, promote headers.</li>
                <li>Close &amp; Apply all three queries.</li>
                <li>Create relationships: Employees[EmployeeID] → Sales[EmployeeID].</li>
                <li>Create relationship: Departments[Department] → Employees[Department].</li>
              </ol>
            )},
          ]} />
          <Tabs items={[
            { label: "Data Types", children: (
              <ul>
                <li>Always verify data type icons in each column.</li>
                <li>Numbers stored as text cannot aggregate correctly in visuals.</li>
                <li>Dates must be proper Date type for slicing and trends.</li>
              </ul>
            )},
            { label: "Text Functions", children: (
              <ul>
                <li>Replace Values for symbols and bad values.</li>
                <li>Trim + Clean for spacing and hidden characters.</li>
                <li>Capitalize Each Word for consistent presentation.</li>
              </ul>
            )},
            { label: "Rows/Columns", children: (
              <ul>
                <li>Remove Top Rows for pre-header report titles.</li>
                <li>Remove Blank Rows to stabilize joins.</li>
                <li>Remove unused columns early to simplify the model.</li>
              </ul>
            )},
            { label: "Analysis Basics", children: (
              <ul>
                <li>Applied Steps are your reusable data-cleaning script.</li>
                <li>Refresh replays the same transformations for new files.</li>
                <li>Use profiling (column quality/distribution) to spot anomalies.</li>
              </ul>
            )},
          ]} />
          <ProgressCheckbox sectionId="s2-powerquery" />
        </section>

        <section className="card" id="s2-analysis">
          <h2 className="section-title">Part 3: Analysis Features</h2>
          <Accordion single openFirst items={[
            { title: "Slicers and cross-filtering", children: (
              <ul>
                <li>Create Region + Category slicers and demonstrate combined filtering.</li>
                <li>Use Edit Interactions to control filter/highlight behavior.</li>
                <li>Explain why slicers are a must-have for business stakeholders.</li>
              </ul>
            )},
            { title: "Drillthrough and detail pages", children: (
              <ul>
                <li>Create a Customer Detail page and add CustomerName as drillthrough field.</li>
                <li>Right-click from summary visuals to navigate to detail context.</li>
                <li>Use back button to return to the summary page.</li>
              </ul>
            )},
            { title: "Conditional formatting and tooltips", children: (
              <ul>
                <li>Apply color scales to matrix cells for fast interpretation.</li>
                <li>Add extra tooltip measures for richer context on hover.</li>
                <li>Briefly show bookmarks for guided navigation.</li>
              </ul>
            )},
          ]} />
          <ProgressCheckbox sectionId="s2-analysis" />
        </section>

        <section className="card" id="s2-next-steps">
          <h2 className="section-title">Further Learning &amp; Next Steps</h2>
          <div className="note warning">
            <p>
              Final reminder: this bootcamp is only an introduction. It gives learners a practical start but they will need deeper study to master DAX and Power Query.
            </p>
          </div>
          <div className="btn-row">
            <a className="button primary" href="https://www.datacamp.com/courses/introduction-to-power-bi">Intro Course (up to 4 hrs)</a>
            <a className="button primary" href="https://www.datacamp.com/tracks/power-bi-fundamentals">Full Power BI Fundamentals Track (17 hrs)</a>
          </div>
          <div className="table-wrap spaced-top">
            <table>
              <thead><tr><th>Learning Path</th><th>Goal</th><th>Suggested Resource</th></tr></thead>
              <tbody>
                <tr><td>DAX Mastery</td><td>Context transition, time intelligence, optimization</td><td>SQLBI learning tracks + DAX Guide practice</td></tr>
                <tr><td>Power Query Mastery</td><td>Advanced shaping, query folding, M functions</td><td>Microsoft Learn Power Query path + hands-on projects</td></tr>
                <tr><td>Power BI Delivery</td><td>Publishing, sharing, governance, refresh</td><td>Microsoft Learn service administration modules</td></tr>
                <tr><td>Structured Learning</td><td>Complete Power BI fundamentals (17 hours)</td><td><a href="https://www.datacamp.com/tracks/power-bi-fundamentals">DataCamp Power BI Fundamentals Track</a></td></tr>
                <tr><td>Practical Practice</td><td>Portfolio-quality dashboards and storytelling</td><td>Repeat this course workflow on new datasets</td></tr>
              </tbody>
            </table>
          </div>
          <ProgressCheckbox sectionId="s2-next-steps" />
        </section>
      </main>

      <footer className="footer">
        <div className="footer-card">
          <strong>Session 2 complete.</strong> You now have a beginner-ready foundation in visuals, modelling, DAX, and Power Query.
        </div>
      </footer>
    </>
  );
}
