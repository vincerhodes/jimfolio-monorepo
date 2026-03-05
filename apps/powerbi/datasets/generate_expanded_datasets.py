#!/usr/bin/env python3
"""Generate larger clean/dirty Power BI course datasets.

This script reads the existing clean dataset structure as a seed, then regenerates:
- clean tables with realistic volume and joins
- dirty tables with repeatable quality issues for Power Query demos
"""

from __future__ import annotations

import argparse
import csv
import random
from datetime import date, datetime, timedelta
from pathlib import Path
from typing import Iterable

RANDOM_SEED = 20260305


def load_seed_values(clean_dir: Path) -> tuple[list[str], list[str], list[str]]:
    """Load regions, segments, and categories from current clean files."""
    regions: set[str] = set()
    segments: set[str] = set()
    categories: set[str] = set()

    customers_path = clean_dir / "Customers.csv"
    products_path = clean_dir / "Products.csv"

    if customers_path.exists():
        with customers_path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if row.get("Region"):
                    regions.add(row["Region"].strip())
                if row.get("Segment"):
                    segments.add(row["Segment"].strip())

    if products_path.exists():
        with products_path.open(newline="", encoding="utf-8") as handle:
            for row in csv.DictReader(handle):
                if row.get("Category"):
                    categories.add(row["Category"].strip())

    if not regions:
        regions = {"North", "South", "East", "West"}
    if not segments:
        segments = {"Corporate", "Small Business", "Enterprise"}
    if not categories:
        categories = {"Furniture", "Technology", "Office Supplies"}

    return sorted(regions), sorted(segments), sorted(categories)


def random_date(start: date, end: date) -> date:
    days = (end - start).days
    return start + timedelta(days=random.randint(0, days))


def title_case_business_name() -> str:
    prefixes = [
        "Atlas",
        "Summit",
        "Northwind",
        "Riverdale",
        "Crescent",
        "Bluewave",
        "Oakwood",
        "Horizon",
        "Pinnacle",
        "Metro",
        "Silverline",
        "Greenfield",
        "Harbor",
        "Sunridge",
        "Lakeside",
        "Prime",
        "Vertex",
        "Westbrook",
        "Sterling",
        "Everest",
    ]
    middles = [
        "Data",
        "Business",
        "Tech",
        "Solutions",
        "Analytics",
        "Systems",
        "Consulting",
        "Group",
        "Partners",
        "Digital",
        "Global",
        "Enterprises",
    ]
    suffixes = ["Ltd", "Inc", "Group", "Holdings", "Partners", "Co"]
    return f"{random.choice(prefixes)} {random.choice(middles)} {random.choice(suffixes)}"


def generate_customers(regions: list[str], segments: list[str], count: int) -> list[dict[str, str]]:
    seen_names: set[str] = set()
    rows: list[dict[str, str]] = []

    while len(rows) < count:
        name = title_case_business_name()
        if name in seen_names:
            continue
        seen_names.add(name)

        customer_id = f"C{len(rows) + 1:04d}"
        rows.append(
            {
                "CustomerID": customer_id,
                "CustomerName": name,
                "Region": random.choice(regions),
                "Segment": random.choice(segments),
                "JoinDate": random_date(date(2020, 1, 1), date(2025, 2, 28)).isoformat(),
            }
        )

    return rows


def generate_products(categories: list[str], count: int) -> list[dict[str, str]]:
    category_terms = {
        "Furniture": [
            "Desk",
            "Chair",
            "Cabinet",
            "Workstation",
            "Bookshelf",
            "Table",
            "Drawer Unit",
            "Storage Rack",
        ],
        "Technology": [
            "Monitor",
            "Laptop Dock",
            "Keyboard",
            "Mouse",
            "Headset",
            "Webcam",
            "Router",
            "Projector",
        ],
        "Office Supplies": [
            "Paper Pack",
            "Marker Set",
            "Notebook",
            "Sticky Notes",
            "Pen Bundle",
            "Planner",
            "Label Roll",
            "Folder Set",
        ],
    }

    rows: list[dict[str, str]] = []
    seen_names: set[str] = set()

    while len(rows) < count:
        category = random.choice(categories)
        term_pool = category_terms.get(category, ["Item", "Bundle", "Kit"])
        descriptor = random.choice(["Pro", "Plus", "Core", "Advanced", "Compact", "Max"])
        product_name = f"{random.choice(term_pool)} {descriptor}"

        if product_name in seen_names:
            product_name = f"{product_name} {len(rows) + 1}"
        seen_names.add(product_name)

        if category == "Furniture":
            price = round(random.uniform(120, 980), 2)
        elif category == "Technology":
            price = round(random.uniform(45, 1400), 2)
        else:
            price = round(random.uniform(6, 180), 2)

        rows.append(
            {
                "ProductID": f"P{len(rows) + 1:04d}",
                "ProductName": product_name,
                "Category": category,
                "UnitPrice": f"{price:.2f}",
            }
        )

    return rows


def weighted_choice(values: Iterable[tuple[float, float]]) -> float:
    roll = random.random()
    cumulative = 0.0
    for threshold, value in values:
        cumulative += threshold
        if roll <= cumulative:
            return value
    return list(values)[-1][1]


def generate_orders(customers: list[dict[str, str]], products: list[dict[str, str]], count: int) -> list[dict[str, str]]:
    customer_ids = [row["CustomerID"] for row in customers]
    product_ids = [row["ProductID"] for row in products]

    rows: list[dict[str, str]] = []
    for idx in range(1, count + 1):
        quantity = random.choices([1, 2, 3, 4, 5, 6, 8, 10, 12], weights=[22, 20, 16, 12, 10, 8, 5, 4, 3], k=1)[0]
        discount = weighted_choice(
            [
                (0.48, 0.00),
                (0.24, 0.05),
                (0.18, 0.10),
                (0.08, 0.15),
                (0.02, 0.20),
            ]
        )

        rows.append(
            {
                "OrderID": f"ORD{idx:05d}",
                "OrderDate": random_date(date(2023, 1, 1), date(2025, 12, 31)).isoformat(),
                "CustomerID": random.choice(customer_ids),
                "ProductID": random.choice(product_ids),
                "Quantity": str(quantity),
                "Discount": f"{discount:.2f}",
            }
        )

    return rows


def generate_targets(regions: list[str], categories: list[str]) -> list[dict[str, str]]:
    base_by_category = {
        "Furniture": 150000,
        "Technology": 190000,
        "Office Supplies": 95000,
    }
    region_modifier = {"North": 1.04, "South": 0.96, "East": 1.09, "West": 0.92}

    rows: list[dict[str, str]] = []
    quarters = ["Q1", "Q2", "Q3", "Q4"]
    years = [2023, 2024, 2025]

    tid = 1
    for year in years:
        for quarter in quarters:
            quarter_adj = {"Q1": 0.92, "Q2": 0.98, "Q3": 1.04, "Q4": 1.12}[quarter]
            for region in regions:
                for category in categories:
                    baseline = base_by_category.get(category, 120000)
                    reg_adj = region_modifier.get(region, 1.0)
                    jitter = random.uniform(0.92, 1.11)
                    target_amount = int(baseline * reg_adj * quarter_adj * jitter)
                    rows.append(
                        {
                            "TargetID": f"T{tid:04d}",
                            "Region": region,
                            "Category": category,
                            "Quarter": f"{quarter} {year}",
                            "TargetAmount": str(target_amount),
                        }
                    )
                    tid += 1

    return rows


def ordinal_day(n: int) -> str:
    if 11 <= (n % 100) <= 13:
        suffix = "th"
    else:
        suffix = {1: "st", 2: "nd", 3: "rd"}.get(n % 10, "th")
    return f"{n}{suffix}"


def mixed_date_text(value: date) -> str:
    formats = [
        value.isoformat(),
        value.strftime("%d/%m/%Y"),
        value.strftime("%m/%d/%Y"),
        f"{ordinal_day(value.day)} {value.strftime('%B %Y')}",
    ]
    return random.choice(formats)


def random_case(text: str) -> str:
    mode = random.choice(["lower", "upper", "title", "raw"])
    if mode == "lower":
        return text.lower()
    if mode == "upper":
        return text.upper()
    if mode == "title":
        return text.title()
    return text


def maybe_double_space(text: str) -> str:
    if random.random() > 0.22:
        return text
    parts = text.split(" ")
    if len(parts) <= 1:
        return text
    return f"{parts[0]}  {' '.join(parts[1:])}"


def generate_dirty_departments(dept_count: int, employee_ids: list[str]) -> list[dict[str, str]]:
    department_roots = [
        "Sales",
        "Marketing",
        "IT",
        "HR",
        "Finance",
        "Operations",
        "Support",
        "Procurement",
        "Customer Success",
        "Analytics",
        "Compliance",
        "Admin",
    ]
    locations = [
        "London - Floor 1",
        "London - Floor 2",
        "London - Floor 3",
        "Manchester - Floor 1",
        "Manchester - Floor 2",
        "Bristol - Floor 1",
        "Leeds - Floor 2",
        "Remote",
    ]

    rows: list[dict[str, str]] = []
    for idx in range(1, dept_count + 1):
        root = random.choice(department_roots)
        name = f"{root} {idx:03d}" if idx > len(department_roots) else root
        budget = random.randint(60000, 460000)
        rows.append(
            {
                "DeptID": f"D{idx:03d}",
                "Department": name,
                "Manager": random.choice(employee_ids),
                "Budget": str(budget),
                "Location": random.choice(locations),
            }
        )

    return rows


def generate_dirty_employees(row_count: int, departments: list[dict[str, str]]) -> list[dict[str, str]]:
    first_names = [
        "John",
        "Sarah",
        "Mike",
        "Emma",
        "David",
        "Lisa",
        "James",
        "Rachel",
        "Tom",
        "Amy",
        "Chris",
        "Sophie",
        "Mark",
        "Kate",
        "Daniel",
        "Laura",
        "Oliver",
        "Hannah",
        "Ben",
        "Megan",
        "Nathan",
        "Leah",
        "Ethan",
        "Zoe",
    ]
    last_names = [
        "Smith",
        "Jones",
        "Johnson",
        "Wilson",
        "Brown",
        "Taylor",
        "Davies",
        "Green",
        "Harris",
        "Clarke",
        "Evans",
        "Turner",
        "Williams",
        "Robinson",
        "Lee",
        "White",
        "Jackson",
        "Scott",
        "Thompson",
        "Hill",
        "Walker",
        "Cooper",
        "King",
        "Ward",
    ]

    department_names = [d["Department"] for d in departments]
    rows: list[dict[str, str]] = []

    for idx in range(1, row_count + 1):
        eid = f"E{idx:03d}"
        full_name = f"{random.choice(first_names)} {random.choice(last_names)}"
        full_name = maybe_double_space(random_case(full_name))

        salary_value = random.randint(30000, 82000)
        salary_roll = random.random()
        if salary_roll < 0.06:
            salary = "N/A"
        elif salary_roll < 0.11:
            salary = "PENDING"
        elif salary_roll < 0.15:
            salary = ""
        else:
            salary = str(salary_value)

        start_date = random_date(date(2019, 1, 1), date(2025, 2, 28))
        rows.append(
            {
                "EmployeeID": eid,
                "FullName": full_name,
                "Department": random.choice(department_names),
                "Salary": salary,
                "StartDate": mixed_date_text(start_date),
            }
        )

    return rows


def render_sale_amount(base_amount: float) -> str:
    roll = random.random()
    if roll < 0.04:
        return "REFUND"
    if roll < 0.07:
        return "TBC"
    if roll < 0.10:
        return f"-{base_amount:.0f}"
    if roll < 0.44:
        return f"£{base_amount:.2f}"
    if roll < 0.74:
        return f"{base_amount:.2f}"
    return f"{base_amount:.0f}"


def generate_dirty_sales(row_count: int, employee_ids: list[str], regions: list[str]) -> list[dict[str, str]]:
    base_products = [
        ("Widget A", 1250.0),
        ("Widget B", 890.0),
        ("Widget C", 450.0),
        ("Service Package", 2100.5),
        ("Implementation Support", 1650.0),
        ("Training Bundle", 780.0),
    ]

    payment_methods = ["Credit Card", "Bank Transfer", "Cash", "Purchase Order"]
    rows: list[dict[str, str]] = []

    for idx in range(1, row_count + 1):
        product_name, base_amount = random.choice(base_products)
        product_dirty = maybe_double_space(random_case(product_name))

        payment = random.choice(payment_methods)
        if random.random() < 0.18:
            payment = random_case(payment)
        if random.random() < 0.08:
            payment = ""

        region = random_case(random.choice(regions))
        sale_date = mixed_date_text(random_date(date(2023, 1, 1), date(2025, 2, 28)))

        employee = random.choice(employee_ids)
        if random.random() < 0.03:
            employee = f"E{random.randint(900, 999)}"

        rows.append(
            {
                "SaleID": f"S{idx:04d}",
                "EmployeeID": employee,
                "Product Sold": product_dirty,
                "Sale Amount": render_sale_amount(base_amount),
                "Sale Date": sale_date,
                "Payment Method": payment,
                "Customer Region": region,
            }
        )

    return rows


def write_csv(path: Path, fieldnames: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        writer = csv.DictWriter(handle, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def write_dirty_employees(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        handle.write(",,,,\n")
        handle.write(",,,,\n")
        handle.write("Company Staff List - Q4 2023,,,,\n")
        handle.write(f"Report Generated: {datetime.now().strftime('%d/%m/%Y')},,,,\n")
        handle.write(",,,,\n")

        writer = csv.writer(handle)
        writer.writerow(["EmployeeID", "FullName", "Department", "Salary", "StartDate"])
        for row in rows:
            writer.writerow([row["EmployeeID"], row["FullName"], row["Department"], row["Salary"], row["StartDate"]])


def write_dirty_sales(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        handle.write(",,,,,,\n")
        handle.write(",,,,,,\n")
        handle.write("Monthly Sales Report,,,,,,\n")
        handle.write("Prepared by: Finance Team,,,,,,\n")
        handle.write(",,,,,,\n")

        writer = csv.writer(handle)
        writer.writerow(["SaleID", "EmployeeID", "Product Sold", "Sale Amount", "Sale Date", "Payment Method", "Customer Region"])
        for row in rows:
            writer.writerow(
                [
                    row["SaleID"],
                    row["EmployeeID"],
                    row["Product Sold"],
                    row["Sale Amount"],
                    row["Sale Date"],
                    row["Payment Method"],
                    row["Customer Region"],
                ]
            )


def write_dirty_departments(path: Path, rows: list[dict[str, str]]) -> None:
    with path.open("w", newline="", encoding="utf-8") as handle:
        handle.write(",,,,\n")
        handle.write("Department List,,,,\n")
        handle.write(f"Last Updated: {datetime.now().strftime('%b %Y')},,,,\n")
        handle.write(",,,,\n")

        writer = csv.writer(handle)
        writer.writerow(["DeptID", "Department", "Manager", "Budget", "Location"])
        for row in rows:
            writer.writerow([row["DeptID"], row["Department"], row["Manager"], row["Budget"], row["Location"]])


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate expanded course datasets for Power BI demos.")
    parser.add_argument("--customers", type=int, default=1200, help="Number of customer rows")
    parser.add_argument("--products", type=int, default=240, help="Number of product rows")
    parser.add_argument("--orders", type=int, default=8000, help="Number of order rows")
    parser.add_argument("--dirty-rows", type=int, default=500, help="Number of dirty rows for Employees and Sales")
    parser.add_argument("--dirty-departments", type=int, default=500, help="Number of dirty department rows")
    args = parser.parse_args()

    random.seed(RANDOM_SEED)

    dataset_root = Path(__file__).resolve().parent
    clean_dir = dataset_root / "clean"
    dirty_dir = dataset_root / "dirty"

    regions, segments, categories = load_seed_values(clean_dir)

    customers = generate_customers(regions=regions, segments=segments, count=args.customers)
    products = generate_products(categories=categories, count=args.products)
    orders = generate_orders(customers=customers, products=products, count=args.orders)
    targets = generate_targets(regions=regions, categories=categories)

    write_csv(clean_dir / "Customers.csv", ["CustomerID", "CustomerName", "Region", "Segment", "JoinDate"], customers)
    write_csv(clean_dir / "Products.csv", ["ProductID", "ProductName", "Category", "UnitPrice"], products)
    write_csv(clean_dir / "Orders.csv", ["OrderID", "OrderDate", "CustomerID", "ProductID", "Quantity", "Discount"], orders)
    write_csv(clean_dir / "SalesTargets.csv", ["TargetID", "Region", "Category", "Quarter", "TargetAmount"], targets)

    employee_ids = [f"E{i:03d}" for i in range(1, args.dirty_rows + 1)]
    dirty_departments = generate_dirty_departments(dept_count=args.dirty_departments, employee_ids=employee_ids)
    dirty_employees = generate_dirty_employees(row_count=args.dirty_rows, departments=dirty_departments)
    dirty_sales = generate_dirty_sales(row_count=args.dirty_rows, employee_ids=employee_ids, regions=regions)

    write_dirty_employees(dirty_dir / "Employees_Dirty.csv", dirty_employees)
    write_dirty_sales(dirty_dir / "Sales_Dirty.csv", dirty_sales)
    write_dirty_departments(dirty_dir / "Departments_Dirty.csv", dirty_departments)

    print("Generated datasets:")
    print(f"- Clean Customers: {len(customers)}")
    print(f"- Clean Products: {len(products)}")
    print(f"- Clean Orders: {len(orders)}")
    print(f"- Clean SalesTargets: {len(targets)}")
    print(f"- Dirty Employees: {len(dirty_employees)}")
    print(f"- Dirty Sales: {len(dirty_sales)}")
    print(f"- Dirty Departments: {len(dirty_departments)}")


if __name__ == "__main__":
    main()
