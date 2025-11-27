# Sweet Reach - Power Platform Migration Guide

## Overview
This guide details the process of re-platforming the **Sweet Reach** application from Next.js/Prisma to the Microsoft Power Platform. This implementation leverages **Dataverse** for robust data storage, **Model-Driven Apps** for administration, **Canvas Apps** for the end-user experience, and **Power Automate** for business logic.

### Architecture
The solution uses a "Premium" architecture, taking full advantage of Dataverse capabilities.

*   **Database**: Microsoft Dataverse (Premium)
*   **Admin Interface**: Model-Driven App (Desktop focused, data-dense)
*   **User Interface**: Canvas App (Mobile/Tablet focused, highly visual)
*   **Logic & Automation**: Power Automate (Cloud Flows)

### Prerequisites
*   **Power Platform Environment** with Dataverse database installed.
*   **Premium Licenses**: "Power Apps per app" or "Power Apps per user" licenses for all users.
*   **System Administrator** access to the environment.

### Solution Strategy
We will build this as a **Solution** in Power Apps to ensure portability (ALM).

1.  **Create a Solution**: Name it "Sweet Reach".
2.  **Define Data Model**: Create tables in Dataverse mirroring the Prisma schema.
3.  **Build Admin App**: Model-Driven app for Taskings and oversight.
4.  **Build User App**: Canvas app for capturing Insights and feedback.
5.  **Implement Logic**: Automate notifications and status updates.

---

**Next Step**: Proceed to `01-Dataverse-Setup.md` to begin building the data layer.
