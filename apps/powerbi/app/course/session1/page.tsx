import Link from "next/link";
import Header from "@/components/Header";
import Accordion from "@/components/Accordion";
import Tabs from "@/components/Tabs";
import ProgressCheckbox from "@/components/ProgressCheckbox";

export const metadata = { title: "Session 1 | Visualisations & Data Modelling" };

export default function Session1Page() {
  return (
    <>
      <Header
        title="Session 1: Visualisations & Data Modelling"
        subtitle="2 hours · Live demo flow for first-time Power BI users"
        activePage="session1"
      />

      <main className="page-wrap">
        <section className="card hero-card" id="s1-intro">
          <span className="pill">Session 1 Focus</span>
          <h2 className="section-title">Build and Explain Your First Report Page</h2>
          <p>
            This session teaches learners how to load data, build visuals, choose the right chart for a question,
            and connect tables in Model view. It is designed for people who are brand new to data modelling.
          </p>
          <div className="note warning">
            <p>
              Prerequisite reminder: learners should finish the &quot;Introduction to Power BI&quot; module from the overview page before this session starts.
            </p>
          </div>
          <div className="btn-row">
            <Link className="button ghost" href="/course#prerequisites">View Prerequisite Links</Link>
            <Link className="button primary" href="/course/session2">Jump to Session 2</Link>
          </div>
          <ProgressCheckbox sectionId="s1-intro" />
        </section>

        <section className="card" id="s1-agenda">
          <h2 className="section-title">Session Agenda (2 Hours)</h2>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Time</th><th>Topic</th><th>Outcome</th></tr></thead>
              <tbody>
                <tr><td>00:00 - 00:20</td><td>Power BI interface walkthrough</td><td>Learners identify Report, Data, and Model views</td></tr>
                <tr><td>00:20 - 01:10</td><td>Visualisation demos</td><td>Learners can create and format key chart types</td></tr>
                <tr><td>01:10 - 01:15</td><td>Break</td><td>Quick reset</td></tr>
                <tr><td>01:15 - 01:50</td><td>Data modelling in Model view</td><td>Learners create one-to-many relationships</td></tr>
                <tr><td>01:50 - 02:00</td><td>Recap and Q&amp;A</td><td>Learners are ready for DAX + Power Query</td></tr>
              </tbody>
            </table>
          </div>
          <ProgressCheckbox sectionId="s1-agenda" />
        </section>

        <section className="card" id="s1-visual-build">
          <h2 className="section-title">How to Demo Creating Visualisations</h2>
          <p className="subtle">
            Use the accordion below during delivery. Keep one panel open at a time to avoid overwhelming absolute beginners.
          </p>
          <Accordion single openFirst items={[
            { title: "Step Block A: Load Northwind data", children: (
              <>
                <ol>
                  <li>Home &gt; Get Data &gt; Text/CSV.</li>
                  <li>Load <strong>customers.csv</strong>, <strong>products.csv</strong>, <strong>orders.csv</strong>, and <strong>order-details.csv</strong> from the Northwind folder.</li>
                  <li>Call out the Fields pane and explain data type icons.</li>
                </ol>
                <div className="btn-row">
                  <a className="button primary" href="/powerbi/datasets/northwind/customers.csv" download>customers.csv</a>
                  <a className="button primary" href="/powerbi/datasets/northwind/products.csv" download>products.csv</a>
                  <a className="button primary" href="/powerbi/datasets/northwind/orders.csv" download>orders.csv</a>
                  <a className="button primary" href="/powerbi/datasets/northwind/order-details.csv" download>order-details.csv</a>
                </div>
                <div className="note info"><p><strong>Tip:</strong> Show how to rename report pages to &quot;Overview&quot; and &quot;Model Check&quot;.</p></div>
              </>
            )},
            { title: "Step Block B: Build first visuals", children: (
              <ol>
                <li>Create a clustered column chart: Axis = categories[categoryName], Values = order-details[quantity].</li>
                <li>Create a card: Count of orders[orderID].</li>
                <li>Create a line chart: X-axis = orders[orderDate], Values = order-details[quantity].</li>
                <li>Create a matrix: Rows = customers[country], Columns = categories[categoryName], Values = order-details[quantity].</li>
              </ol>
            )},
            { title: "Step Block C: Formatting and interaction", children: (
              <ul>
                <li>Enable titles and data labels for readability.</li>
                <li>Apply consistent colors using the Power BI yellow accent sparingly.</li>
                <li>Add a Region slicer and click values to show cross-filtering.</li>
                <li>Use the visual menu (...) to sort by quantity descending.</li>
              </ul>
            )},
          ]} />
          <ProgressCheckbox sectionId="s1-visual-build" />
        </section>

        <section className="card" id="s1-visual-choices">
          <h2 className="section-title">When to Use Each Visual (and Why)</h2>
          <Tabs items={[
            { label: "Comparison", children: (
              <ul>
                <li><strong>Bar / Column chart:</strong> best for comparing categories.</li>
                <li><strong>Clustered bar:</strong> use with long labels or ranking charts.</li>
                <li><strong>Avoid:</strong> pie charts when you need precise comparisons.</li>
              </ul>
            )},
            { label: "Trend", children: (
              <ul>
                <li><strong>Line chart:</strong> best for order/sales patterns over time.</li>
                <li><strong>Area chart:</strong> good when emphasizing overall volume.</li>
                <li><strong>Avoid:</strong> using trend charts without a time-based axis.</li>
              </ul>
            )},
            { label: "Composition", children: (
              <ul>
                <li><strong>Donut chart:</strong> only when there are 2-5 categories.</li>
                <li><strong>Stacked charts:</strong> compare total + category contribution together.</li>
                <li><strong>Avoid:</strong> too many slices; switch to bars for clarity.</li>
              </ul>
            )},
            { label: "Detail", children: (
              <ul>
                <li><strong>Card:</strong> one KPI headline value.</li>
                <li><strong>Table:</strong> row-level detail for audits.</li>
                <li><strong>Matrix:</strong> pivot-style summary by two dimensions.</li>
              </ul>
            )},
          ]} />
          <ProgressCheckbox sectionId="s1-visual-choices" />
        </section>

        <section className="card" id="s1-model-view">
          <h2 className="section-title">Data Modelling and the Table / Model View</h2>
          <Accordion single openFirst items={[
            { title: "Model setup walkthrough", children: (
              <ol>
                <li>Open Model view and place customers, products, orders, and order-details near each other.</li>
                <li>Create customers[customerID] → orders[customerID].</li>
                <li>Create products[productID] → order-details[productID].</li>
                <li>Create orders[orderID] → order-details[orderID].</li>
                <li>Confirm cardinality is one-to-many in all links.</li>
              </ol>
            )},
            { title: "How to explain relationship behavior", children: (
              <>
                <ul>
                  <li>Dimension tables (customers, products) provide descriptors.</li>
                  <li>Fact tables (orders, order-details) store transactions.</li>
                  <li>Selecting a customer should filter related orders automatically.</li>
                </ul>
                <div className="note info">
                  <p><strong>Simple language:</strong> one customer can have many orders; one product can appear in many order line items.</p>
                </div>
              </>
            )},
            { title: "Common mistakes to demo quickly", children: (
              <ul>
                <li>Data type mismatch between keys (text vs number).</li>
                <li>Trying to relate on messy text without cleaning first.</li>
                <li>Using ambiguous many-to-many links in beginner models.</li>
              </ul>
            )},
          ]} />
          <div className="note warning">
            <p><strong>Instructor note:</strong> keep this practical. Create one visual using fields from Customers + Orders + Products to prove the relationships are working live.</p>
          </div>
          <ProgressCheckbox sectionId="s1-model-view" />
        </section>
      </main>

      <footer className="footer">
        <div className="footer-card">
          <strong>Session 1 complete.</strong> Next up: <Link href="/course/session2">Session 2</Link> for DAX, Power Query, and report analysis features.
        </div>
      </footer>
    </>
  );
}
