import { formatDateTime } from './constants';

function DepositInfo({ deposit }) {
    if (!deposit) return null;

    return (
        <div className="mt-3 space-y-1.5 text-xs text-text-muted">
            {deposit.reported_by?.name && (
                <p>
                    Dilaporkan oleh <span className="font-medium text-text-secondary">{deposit.reported_by.name}</span>
                    {deposit.reported_at && ` · ${formatDateTime(deposit.reported_at)}`}
                </p>
            )}
            {deposit.verified_by?.name && (
                <p>
                    Diverifikasi oleh <span className="font-medium text-text-secondary">{deposit.verified_by.name}</span>
                    {deposit.verified_at && ` · ${formatDateTime(deposit.verified_at)}`}
                </p>
            )}
            {deposit.released_at && (
                <p className="font-medium text-success">Box diambil · {formatDateTime(deposit.released_at)}</p>
            )}
            {deposit.verification_notes && (
                <p className="rounded-md bg-bg-secondary px-2.5 py-2 leading-relaxed text-text-secondary">
                    Catatan kesiswaan: {deposit.verification_notes}
                </p>
            )}
        </div>
    );
}

export default DepositInfo;
