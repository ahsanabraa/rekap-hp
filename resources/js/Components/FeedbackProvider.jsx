import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, ShieldAlert, X, XCircle } from 'lucide-react';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/Components/ui/alert-dialog';
import { cn } from '@/lib/utils';

const FeedbackContext = createContext(null);

const toastTones = {
    success: { icon: CheckCircle2, tile: 'bg-success-light text-success', fallbackTitle: 'Berhasil' },
    danger: { icon: XCircle, tile: 'bg-danger-light text-danger', fallbackTitle: 'Gagal' },
    warning: { icon: AlertTriangle, tile: 'bg-warning-light text-warning', fallbackTitle: 'Perhatian' },
    info: { icon: Info, tile: 'bg-primary-light text-primary', fallbackTitle: 'Informasi' },
};

const confirmTones = {
    primary: {
        icon: Info,
        tile: 'bg-primary-light text-primary',
        action: 'bg-primary hover:bg-primary-hover',
    },
    danger: {
        icon: AlertTriangle,
        tile: 'bg-danger-light text-danger',
        action: 'bg-danger hover:bg-[hsl(0_84%_55%)]',
    },
    warning: {
        icon: ShieldAlert,
        tile: 'bg-warning-light text-warning',
        action: 'bg-warning hover:bg-[hsl(38_92%_45%)]',
    },
};

function ToastCard({ toast, onDismiss }) {
    const meta = toastTones[toast.tone] ?? toastTones.info;
    const Icon = meta.icon;

    return (
        <div
            role="status"
            className="toast-item pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-white p-3.5 shadow-lg"
        >
            <span
                className={cn(
                    'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                    meta.tile,
                )}
            >
                <Icon className="h-5 w-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
                <p className="text-sm font-semibold text-text">{toast.title || meta.fallbackTitle}</p>
                {toast.message && (
                    <p className="mt-0.5 break-words text-xs leading-relaxed text-text-secondary">
                        {toast.message}
                    </p>
                )}
            </div>
            <button
                type="button"
                onClick={onDismiss}
                aria-label="Tutup notifikasi"
                className="-mr-1 -mt-1 rounded-md p-1.5 text-text-muted transition-colors hover:bg-bg-tertiary hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
                <X className="h-4 w-4" aria-hidden="true" />
            </button>
        </div>
    );
}

export function FeedbackProvider({ children }) {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);
    const nextToastId = useRef(0);
    const activeConfirm = useRef(null);

    const dismiss = useCallback((id) => {
        setToasts((current) => current.filter((toast) => toast.id !== id));
    }, []);

    const notify = useCallback(
        (tone, message, options = {}) => {
            const id = ++nextToastId.current;
            const duration = options.duration ?? 5000;

            setToasts((current) => [
                ...current.slice(-3),
                { id, tone, message, title: options.title },
            ]);

            if (duration > 0) {
                window.setTimeout(() => dismiss(id), duration);
            }

            return id;
        },
        [dismiss],
    );

    const finishConfirm = useCallback((result) => {
        const current = activeConfirm.current;
        activeConfirm.current = null;
        setConfirmState(null);
        current?.resolve(result);
    }, []);

    const value = useMemo(
        () => ({
            notify,
            success: (message, options) => notify('success', message, options),
            error: (message, options) => notify('danger', message, options),
            warning: (message, options) => notify('warning', message, options),
            info: (message, options) => notify('info', message, options),
            confirm: (options = {}) =>
                new Promise((resolve) => {
                    const nextConfirm = {
                        tone: 'primary',
                        title: 'Konfirmasi',
                        description: '',
                        confirmLabel: 'Lanjutkan',
                        cancelLabel: 'Batal',
                        ...options,
                        resolve,
                    };

                    activeConfirm.current = nextConfirm;
                    setConfirmState(nextConfirm);
                }),
        }),
        [notify],
    );

    const confirmMeta = confirmTones[confirmState?.tone] ?? confirmTones.primary;
    const ConfirmIcon = confirmMeta.icon;

    return (
        <FeedbackContext.Provider value={value}>
            {children}

            <div
                aria-live="polite"
                className="pointer-events-none fixed inset-x-3 bottom-3 z-[100] flex flex-col-reverse gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:w-[380px]"
            >
                {toasts.map((toast) => (
                    <ToastCard key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
                ))}
            </div>

            {confirmState && (
                <AlertDialog
                    open
                    onOpenChange={(open) => {
                        if (!open) {
                            finishConfirm(false);
                        }
                    }}
                >
                    <AlertDialogContent className="max-w-md gap-0 overflow-hidden rounded-xl p-0">
                        <div className="p-5">
                            <AlertDialogHeader className="flex-row items-start gap-3 space-y-0 text-left">
                                <span
                                    className={cn(
                                        'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                                        confirmMeta.tile,
                                    )}
                                >
                                    <ConfirmIcon className="h-5 w-5" aria-hidden="true" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <AlertDialogTitle className="text-base leading-snug">
                                        {confirmState.title}
                                    </AlertDialogTitle>
                                    {confirmState.description && (
                                        <AlertDialogDescription className="mt-1 text-sm leading-relaxed">
                                            {confirmState.description}
                                        </AlertDialogDescription>
                                    )}
                                </div>
                            </AlertDialogHeader>
                        </div>
                        <AlertDialogFooter className="border-t border-border bg-bg-secondary px-5 py-3 sm:space-x-2">
                            <AlertDialogCancel>{confirmState.cancelLabel}</AlertDialogCancel>
                            <AlertDialogAction
                                className={cn('min-w-[7rem]', confirmMeta.action)}
                                onClick={() => finishConfirm(true)}
                            >
                                {confirmState.confirmLabel}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </FeedbackContext.Provider>
    );
}

export function useFeedback() {
    const context = useContext(FeedbackContext);

    if (!context) {
        throw new Error('useFeedback harus dipakai di dalam FeedbackProvider.');
    }

    return context;
}
