import { useUser } from "@clerk/expo";
import { useEffect } from "react";
import { useSupabase } from "../hooks/useSupabase";
import { useUserStore } from "../store/userStore";

export const useUserSync = () => {
  
  //console.log("Sync Status: Starting db checking...");

  const { user } = useUser();
  const setIsAdmin = useUserStore((state) => state.setIsAdmin);
  const authSupabase = useSupabase();

  useEffect(() => {
    if (!user) return;
    syncUser();
  }, [user]);

  const syncUser = async () => {
    const { data, error : selectError } = await authSupabase
      .from("users")
      .select("clerk_id, is_admin")
      .eq("clerk_id", user!.id)
      .single();

      //if (selectError) {console.log("DB Read Error", selectError.message);}

     if (data) {
    //   console.log("Sync Status: User exists in database!");
       setIsAdmin(data.is_admin ?? false);
       return;
     }
    // console.log("Sync Status: New user detected, inserting into table...");

    const { data: newUser, error:insertError } = await authSupabase
      .from("users")
      .insert({
        clerk_id: user!.id,
        email: user!.emailAddresses[0].emailAddress,
        first_name: user!.firstName,
        last_name: user!.lastName,
        avatar_url: user!.imageUrl,
      })
      .select("is_admin")
      .single();

    //    if (insertError) {
    //   console.log("DB Insert Error", insertError.message);
    // } else {
    //   console.log("Sync Status: Success! User created in Supabase users table.");
    // }
    

    setIsAdmin(newUser?.is_admin ?? false);
  };
};
