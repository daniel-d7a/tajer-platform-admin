import { X } from "lucide-react";

interface onConfirmProps{
    role:string;
    text:string;
    onClose : () => void;
    onConfirm:() => void;
    note:string;
    type:string;
}

export default function ConfirmRole({role,text,onClose,onConfirm,note,type} :onConfirmProps ) {
    return(
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-xl shadow-lg rounded-md bg-white flex flex-col gap-5">
                <div className="w-full flex justify-between items-center">
                    <h2>تاكيد {type} حساب <strong>{role === "SALES_REP" ? "مندوب مبيعات" : "أدمن"}</strong></h2>
                    <button className="cursor-pointer" onClick={onClose}><X/></button>
                </div>
                    <p>{text}</p>
                    *{note}*
                <div>
                    <div className="flex gap-2">
                        <button  onClick={onConfirm} className="bg-[hsl(var(--primary))] text-white px-4 py-2 rounded-md cursor-pointer hover:bg-[hsl(var(--primary))]/90">تاكيد {type} الحساب</button>
                        <button 
                         onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 cursor-pointer"
                        >إلغاء</button>
                    </div>
                </div>
            </div>
        </div>
    );
};