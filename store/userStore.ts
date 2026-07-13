import {create} from "zustand";

interface userStore{
    isAdmin : boolean;
    setIsAdmin :(value: boolean) => void;
}

export const useUserStore = create<userStore>((set)=>({
    isAdmin: false,
    setIsAdmin: (value) => set({isAdmin: value}),  
}))