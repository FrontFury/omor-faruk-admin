import { useQuery } from "@tanstack/react-query";

import useAxiosSecure from "../hook/useAxiosSecure";
import useAuth from "./useAuth";

const useRole = () => {
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const { data: role = null, isLoading: isRoleLoading } = useQuery({
    queryKey: ["user-role", user?.email],
    enabled: !authLoading && !!user?.email,
    queryFn: async () => {
      const res = await axiosSecure.get(`/users/role/${user.email}`);
      return res.data?.role || null;
    },
    staleTime: 0,
    gcTime: 0,
  });

  return { 
    role: user ? role : null, 
    roleLoading: authLoading || (!!user?.email && isRoleLoading) 
  };
};

export default useRole;