import { useForm, useRef, useState } from 'react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/Components/ui/alert-dialog';

export default function DeleteUserForm() {
    const [confirmingUserDeletion, setConfirmingUserDeletion] = useState(false);
    const passwordInput = useRef();

    const { data, setData, delete: destroy, processing, reset, errors, clearErrors } = useForm({
        password: '',
    });

    const deleteUser = (e) => {
        e.preventDefault();
        destroy(route('profile.destroy'), {
            preserveScroll: true,
            onSuccess: () => {
                closeModal();
            },
            onError: () => {
                passwordInput.current?.focus();
            },
            onFinish: () => reset(),
        });
    };

    const closeModal = () => {
        setConfirmingUserDeletion(false);
        clearErrors();
        reset();
    };

    return (
        <AlertDialog open={confirmingUserDeletion} onOpenChange={setConfirmingUserDeletion}>
            <AlertDialogTrigger asChild>
                <Button variant="danger" onClick={() => setConfirmingUserDeletion(true)}>
                    Hapus Akun
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <form onSubmit={deleteUser} className="space-y-4">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Yakin ingin menghapus akun?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tindakan ini permanen dan tidak dapat dibatalkan. Semua data Anda akan dihapus.
                            Silakan masukkan password untuk konfirmasi.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="sr-only">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            name="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                        />
                        {errors.password && <p className="error-text" role="alert">{errors.password}</p>}
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={closeModal}>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={deleteUser} className="bg-danger hover:bg-[hsl(0_84%_55%)]" disabled={processing}>
                            {processing ? 'Menghapus...' : 'Hapus Akun'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}