'use client';

import { updateActionStatus } from '../../actions';

export function ActionStatusSelect({
    actionId,
    insightId,
    status
}: {
    actionId: string;
    insightId: string;
    status: string
}) {
    return (
        <form action={updateActionStatus}>
            <input type="hidden" name="actionId" value={actionId} />
            <input type="hidden" name="insightId" value={insightId} />
            <select
                name="status"
                defaultValue={status}
                className="text-xs border border-gray-300 rounded p-1 bg-white"
                onChange={(e) => e.target.form?.requestSubmit()}
            >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
            </select>
        </form>
    );
}
