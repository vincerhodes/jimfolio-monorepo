# Step 4: Automation & Security

## 1. Power Automate Flows
We will create "Cloud Flows" to handle notifications and background logic.

### Flow A: Notify Manager on New Insight
*   **Trigger**: Dataverse - "When a row is added, modified or deleted"
    *   **Change type**: Added
    *   **Table name**: Insights
    *   **Scope**: Organization
*   **Action**: Get Row (Get the Author's details to include in the email).
*   **Condition**: If `Tasking` is not empty (i.e., it's a response to a tasking).
    *   **Yes**: Send an email (Outlook connector) to the `Requesting Team` manager (or a specific group email).
    *   **No**: Send an email to the general "Sweet Reach Managers" distribution list.
*   **Email Content**:
    *   Subject: "New Insight: @{triggerBody()?['title']}"
    *   Body: "A new insight has been submitted by @{outputs('Get_Author')?['fullname']}. \n\n Description: @{triggerBody()?['description']} \n\n Link to App: [App Url]"

### Flow B: Notify Author on Review
*   **Trigger**: Dataverse - "When a row is added"
    *   **Table name**: Reviews
*   **Action**: Get Related Insight (Expand query to get the Author).
*   **Action**: Send an email notification (or Teams message) to the Author of the Insight.
    *   Subject: "Your Insight has been reviewed"
    *   Body: "Manager @{triggerBody()?['_ownerid_value']} has reviewed your insight. \n\n Comments: @{triggerBody()?['content']}"

## 2. Security Roles
We need to define who can do what. We will create custom Security Roles in the Solution.

### Role: Sweet Reach Officer (User)
*   **Custom Entity Privileges**:
    *   **Insight**: Create (User), Read (Organization - if open) or (User - if private), Write (User), Append, Append To.
    *   **Tasking**: Read (Organization).
    *   **Insight Feedback**: Create (User), Read (User).
    *   **Action**: Read (User/Team).
    *   **App Feedback**: Create (User).
*   **Standard Privileges**:
    *   **Model-Driven App**: Read (if they need access, otherwise None).
    *   **Canvas App**: Read, Share.

### Role: Sweet Reach Manager
*   **Custom Entity Privileges**:
    *   **Insight**: Create, Read, Write, Delete, Assign, Share (Organization Level).
    *   **Tasking**: Create, Read, Write, Delete (Organization Level).
    *   **Review**: Create, Read, Write.
    *   **Action**: Create, Read, Write.
    *   **User**: Read (Organization).
*   This role grants full access to manage the content within the Model-Driven App.

### Role: Sweet Reach Stakeholder
*   **Custom Entity Privileges**:
    *   **Insight**: Read (Organization Level).
    *   **Tasking**: Read (Organization Level).
    *   **Action**: Read (Organization Level).
*   **No Create/Write Access**: Purely for viewing dashboards and reports.

## 3. Deployment
1.  **Assign Roles**:
    *   Go to the Power Platform Admin Center.
    *   Select the Environment.
    *   Go to **Users**.
    *   Select users and click **Manage Security Roles**.
    *   Assign "Sweet Reach Officer" to general staff.
    *   Assign "Sweet Reach Manager" to admin staff.
2.  **Share Apps**:
    *   Share the **Sweet Reach Mobile** (Canvas App) with the "Sweet Reach Officer" security role (or "Everyone").
    *   Share the **Sweet Reach Admin** (Model-Driven App) with the "Sweet Reach Manager" security role.

## 4. Final Check
*   Verify that Officers cannot delete Taskings.
*   Verify that Managers receive emails when Insights are created.
*   Verify that the Canvas App correctly filters data based on the logged-in user.

---
**Completion**: You have now successfully architected and documented the build process for Sweet Reach on the Power Platform.
