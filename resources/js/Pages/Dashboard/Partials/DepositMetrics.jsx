import Metric from './Metric';

function DepositMetrics({ deposit }) {
    const reported = deposit?.reported_count ?? 0;
    const verified = deposit?.verified_count;
    const difference = verified === null || verified === undefined ? null : verified - reported;

    return (
        <div className="grid grid-cols-3 gap-2">
            <Metric label="Dilaporkan" value={deposit ? reported : '-'} />
            <Metric
                label="Fisik"
                value={verified === null || verified === undefined ? '-' : verified}
                tone={difference === null ? 'neutral' : difference === 0 ? 'success' : 'danger'}
            />
            <Metric
                label="Selisih"
                value={
                    difference === null || difference === undefined
                        ? '-'
                        : difference === 0
                          ? '0'
                          : difference < 0
                            ? `-${Math.abs(difference)}`
                            : `+${difference}`
                }
                tone={difference === null || difference === undefined ? 'neutral' : difference === 0 ? 'success' : 'danger'}
            />
        </div>
    );
}

export default DepositMetrics;
