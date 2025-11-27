# Step 3: Canvas App (User Experience)

The Canvas App is the primary interface for Officers/Users to submit insights and view relevant information on mobile or tablet.

## 1. Create the App
1.  Inside your Solution, click **New** -> **App** -> **Canvas app**.
2.  **Name**: Sweet Reach Mobile
3.  **Format**: Phone (or Tablet, depending on preference). Phone is recommended for field usage.

## 2. Connect Data
Add the following Dataverse tables to your app data sources:
*   Insights
*   Taskings
*   Users
*   Insight Feedbacks

## 3. Build Screens

### Screen 1: Home / Feed
*   **Header**: "Sweet Reach", User Avatar.
*   **Gallery (The Feed)**:
    *   **Items**: `SortByColumns(Filter(Insights, Status = 'jim_insightstatus'.Reviewed), "createdon", SortOrder.Descending)`
    *   **Layout**: Card style showing Title, Author Image, Date, and a snippet of Description.
    *   **Search/Filter**: Add a Text Input for search and a Dropdown for filtering by 'Topic Tag' or 'Team'.
*   **FAB (Floating Action Button)**:
    *   A generic "+" button in the bottom right.
    *   `OnSelect`: `Navigate('Create Insight Screen')`

### Screen 2: Create Insight
*   **Header**: "New Insight", Back button.
*   **Form (Edit Form)**:
    *   **DataSource**: Insights
    *   **DefaultMode**: `FormMode.New`
    *   **Fields**:
        *   Title
        *   Description (Multi-line text)
        *   Type (Dropdown)
        *   Tasking (ComboBox - allow searching active taskings)
        *   Team Tag
        *   Topic Tag
        *   Country
*   **Submit Button**:
    *   `OnSelect`: `SubmitForm(Form1); Navigate('Success Screen')`

### Screen 3: Tasking List
*   **Purpose**: Show users what specific information is currently requested.
*   **Gallery**:
    *   **Items**: `Filter(Taskings, Status = 'Active')`
    *   **Layout**: Title, Requesting Team, Deadline (formatted `Red` if close).
*   **Interaction**: Clicking a Tasking navigates to **Create Insight** with the Tasking field pre-populated.
    *   `OnSelect`: `Navigate('Create Insight Screen', ScreenTransition.Cover, { varSelectedTasking: ThisItem })`
    *   *Note: Update the Item property of the Tasking Card in 'Create Insight' to use `varSelectedTasking` if not blank.*

### Screen 4: Insight Detail
*   **Purpose**: Read full insight and leave feedback.
*   **Components**:
    *   Full details of the selected item from the Feed Gallery.
    *   **Like/Rate Section**:
        *   Star Rating control.
        *   "Submit Feedback" button that patches a new record to **Insight Feedbacks**.
        *   Formula:
            ```powerfx
            Patch('Insight Feedbacks', Defaults('Insight Feedbacks'), {
                Rating: RatingInput.Value,
                Comment: CommentInput.Text,
                Insight: Gallery1.Selected,
                User: User()
            })
            ```

## 4. UX Polish
*   **Theme**: Use the "Sweet Reach" color palette (Extract from current Next.js app if needed, otherwise stick to clean blues and whites).
*   **Navigation**: Create a bottom component for navigation (Home, Taskings, Profile).

## 5. Publish
1.  Save the App.
2.  Publish the version.

---
**Next Step**: Proceed to `04-Automation-Security.md` to secure the app and add automation.
