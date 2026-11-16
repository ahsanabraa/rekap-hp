import { ShieldAlert } from 'lucide-react';

function AttentionNotice({ schoolClass, flagWindowDays }) {
    if (!schoolClass?.needs_attention) return null;

    return (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-danger-light bg-danger-light px-3 py-2.5 text-sm text-danger sm:mb-4 sm:px-4">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div>
                <p className="font-medium">Kelas ini perlu perhatian khusus.</p>
                <p className="mt-0.5 text-xs leading-relaxed">
                    Sudah {schoolClass.shortages_last_30_days}x tercatat jumlah HP kurang dari laporan dalam{' '}
                    {flagWindowDays} hari terakhir. Hitung ulang box dengan teliti.
                </p>
            </div>
        </div>
    );
}

export default AttentionNotice;
