import Link from "next/link";
import Header from "@/components/Header";
import Accordion from "@/components/Accordion";
import Tabs from "@/components/Tabs";
import ProgressCheckbox from "@/components/ProgressCheckbox";

export const metadata = { title: "Power BI for Beginners | Course Overview" };

export default function OverviewPage() {
  return (
    <>
      <Header
        title="Power BI Fundamentals Bootcamp"
        subtitle="2 live sessions · Beginner-friendly · Instructor-led"
        activePage="overview"
      />

      <main className="page-wrap">
        <section className="card hero-card" id="overview-intro">
          <span className="pill">Course Orientation</span>
          <h2 className="section-title">Start Here Before Session 1</h2>
          <p>
            This course is built for non-technical beginners and focuses on practical Power BI report-building skills.
            It is delivered as <strong>2 x 2-hour live virtual sessions</strong> on Microsoft Teams.
          </p>
          <p className="disclaimer">
            Important: this program is an introduction to get learners started. It does not make anyone an advanced Power BI developer in two sessions.
          </p>
          <div className="badge-row">
            <span className="badge yellow">Absolute beginners welcome</span>
            <span className="badge">Demo-first approach</span>
            <span className="badge green">Hands-on datasets included</span>
          </div>
          <ProgressCheckbox sectionId="overview-intro" />
        </section>

        <section className="card" id="prerequisites">
          <h2 className="section-title">Mandatory Prerequisite</h2>
          <div className="note warning">
            <p>
              All learners must complete the <strong>&quot;Introduction to Power BI&quot; module</strong> before attending Session 1.
              This keeps the live sessions focused on practical dashboard building instead of basic setup.
            </p>
          </div>
          <ul>
            <li>Complete the prerequisite module before the first instructor-led demo (up to 4 hours).</li>
            <li>Install Power BI Desktop and download the course dataset pack.</li>
          </ul>
          <div className="btn-row">
            <a className="button primary" href="https://www.datacamp.com/courses/introduction-to-power-bi">Introduction to Power BI Course</a>
          </div>
          <ProgressCheckbox sectionId="prerequisites" />
        </section>

        <section className="card" id="course-map">
          <h2 className="section-title">2-Session Delivery Plan</h2>
          <div className="grid-2">
            <article className="card tight-card">
              <p className="kicker">Session 1 (2 hours)</p>
              <h3>Visualisation &amp; Data Modelling Basics</h3>
              <ul>
                <li>Power BI interface walkthrough</li>
                <li>How to build visuals step by step</li>
                <li>When to use each visual type</li>
                <li>Model view and table relationships</li>
              </ul>
              <Link className="button primary" href="/course/session1">Open Session 1 guide</Link>
            </article>
            <article className="card tight-card">
              <p className="kicker">Session 2 (2 hours)</p>
              <h3>DAX, Power Query &amp; Analysis Features</h3>
              <ul>
                <li>Basic DAX measures for KPIs</li>
                <li>Power Query data cleaning with buttons</li>
                <li>Slicers, drillthrough, and formatting</li>
                <li>Next steps for continued learning</li>
              </ul>
              <Link className="button primary" href="/course/session2">Open Session 2 guide</Link>
            </article>
          </div>
          <ProgressCheckbox sectionId="course-map" />
        </section>

        <section className="card" id="skill-overview">
          <h2 className="section-title">What Learners Will Practice</h2>
          <Tabs items={[
            { label: "Visuals", children: (
              <ul>
                <li>Create bar, line, card, matrix, and donut visuals.</li>
                <li>Format titles, labels, legends, and color themes.</li>
                <li>Choose visuals based on business questions.</li>
              </ul>
            )},
            { label: "Data Modelling", children: (
              <ul>
                <li>Use Model view to create one-to-many relationships.</li>
                <li>Understand fact vs dimension tables.</li>
                <li>Use relationships to combine fields across tables in one visual.</li>
              </ul>
            )},
            { label: "DAX & Power Query", children: (
              <ul>
                <li>Build beginner DAX measures (SUM, COUNTROWS, DIVIDE, CALCULATE).</li>
                <li>Clean messy files with Remove Rows, Replace Values, Fill Down, and data types.</li>
                <li>Apply slicers and drillthrough for business-friendly report exploration.</li>
              </ul>
            )},
          ]} />
          <ProgressCheckbox sectionId="skill-overview" />
        </section>

        <section className="card" id="datasets">
          <h2 className="section-title">Dataset Packs for Demos</h2>
          <p className="subtle">
            The Northwind dataset is a classic sample database for modelling/report creation. The dirty dataset is intentionally flawed for Power Query exercises.
            <Link className="button ghost" href="/course/data-explorer" style={{ marginLeft: "0.5rem" }}>Explore All Data</Link>
          </p>
          <Accordion single openFirst items={[
            { title: "Northwind Pack (Session 1) - Clean Data", children: (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>File</th><th>Use Case</th><th>Key Join Columns</th><th>Download</th></tr></thead>
                  <tbody>
                    <tr><td>customers.csv</td><td>Customer attributes and regions</td><td>customerID</td><td><a className="button primary" href="/powerbi/datasets/northwind/customers.csv" download>Download</a></td></tr>
                    <tr><td>products.csv</td><td>Product catalog and categories</td><td>productID</td><td><a className="button primary" href="/powerbi/datasets/northwind/products.csv" download>Download</a></td></tr>
                    <tr><td>orders.csv</td><td>Transactional fact table</td><td>orderID, customerID</td><td><a className="button primary" href="/powerbi/datasets/northwind/orders.csv" download>Download</a></td></tr>
                    <tr><td>order-details.csv</td><td>Order line items (link orders to products)</td><td>orderID, productID</td><td><a className="button primary" href="/powerbi/datasets/northwind/order-details.csv" download>Download</a></td></tr>
                    <tr><td>employees.csv</td><td>Employee information</td><td>employeeID</td><td><a className="button primary" href="/powerbi/datasets/northwind/employees.csv" download>Download</a></td></tr>
                    <tr><td>categories.csv</td><td>Product categories</td><td>categoryID</td><td><a className="button primary" href="/powerbi/datasets/northwind/categories.csv" download>Download</a></td></tr>
                  </tbody>
                </table>
              </div>
            )},
            { title: "Dirty Pack (Session 2)", children: (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>File</th><th>Intended Cleaning Demo</th><th>Issues Injected</th><th>Download</th></tr></thead>
                  <tbody>
                    <tr><td>Employees_Dirty.csv</td><td>Text cleanup + salary type fixes</td><td>header noise, casing, N/A/PENDING, mixed dates</td><td><a className="button primary" href="/powerbi/datasets/dirty/Employees_Dirty.csv" download>Download</a></td></tr>
                    <tr><td>Sales_Dirty.csv</td><td>Currency/date cleanup + fill down</td><td>£ symbols, REFUND/TBC, blanks, mixed casing</td><td><a className="button primary" href="/powerbi/datasets/dirty/Sales_Dirty.csv" download>Download</a></td></tr>
                    <tr><td>Departments_Dirty.csv</td><td>Header row cleanup + joins</td><td>extra rows + blank lines</td><td><a className="button primary" href="/powerbi/datasets/dirty/Departments_Dirty.csv" download>Download</a></td></tr>
                  </tbody>
                </table>
              </div>
            )},
          ]} />
          <ProgressCheckbox sectionId="datasets" />
        </section>

        <section className="card" id="instructor-checklist">
          <h2 className="section-title">Instructor Checklist Before Going Live</h2>
          <div className="callout-matrix">
            <article className="mini-card">
              <h4>Environment Prep</h4>
              <ul>
                <li>Power BI Desktop installed and tested</li>
                <li>Dataset folder downloaded locally</li>
                <li>Demo PBIX starter file available</li>
              </ul>
            </article>
            <article className="mini-card">
              <h4>Participant Prep</h4>
              <ul>
                <li>Prerequisite module completed</li>
                <li>Course links shared in advance</li>
                <li>Session links and timings confirmed</li>
              </ul>
            </article>
          </div>
          <ProgressCheckbox sectionId="instructor-checklist" />
        </section>
      </main>

      <footer className="footer">
        <div className="footer-card">
          <strong>Power BI Beginner Course</strong> · Designed for first-time users · Continue with <Link href="/course/session1">Session 1</Link> and <Link href="/course/session2">Session 2</Link>.
        </div>
      </footer>
    </>
  );
}
