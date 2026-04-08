import { useNavigate } from 'react-router-dom';

const Toast = ({ id, message, type, link, onRemove }) => {
    const navigate = useNavigate();

    const icons = {
        success: (
            <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
            </div>
        ),
        error: (
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
            </div>
        ),
        info: (
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
        )
    };

    const handleDismiss = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove(id);
    };

    const handleClick = () => {
        if (link) {
            navigate(link);
        }
        onRemove(id);
    };

    return (
        <div 
            onClick={handleClick}
            className="group glass-card p-4 pr-10 shadow-2xl border-white/20 min-w-[320px] max-w-md animate-slide-up hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden"
        >
            <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 animate-toast-progress"></div>
            
            <div className="flex items-center gap-4">
                {icons[type] || icons.info}
                <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-gray-900 dark:text-white uppercase tracking-widest mb-1">New Alert</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 leading-relaxed truncate-2-lines">
                        {message}
                    </p>
                </div>
            </div>

            <button 
                onClick={handleDismiss}
                className="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-all z-10"
                aria-label="Dismiss notification"
            >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>
    );
};

export const ToastContainer = ({ toasts, onRemove }) => {
    return (
        <div className="fixed top-24 right-6 z-[9999] flex flex-col gap-4 pointer-events-none">
            <div className="flex flex-col gap-4 pointer-events-auto">
                {toasts.map(toast => (
                    <Toast key={toast.id} {...toast} onRemove={onRemove} />
                ))}
            </div>
        </div>
    );
};

export default Toast;
