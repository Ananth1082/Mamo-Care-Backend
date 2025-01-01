export const checkDoctor: any = ({ set, jwt_payload }: any) => {
  if (jwt_payload.role !== "Doctor") {
    if (set.status) set.status = 401;
    return {
      msg: "unauthorized",
      error: "only doctor can access this route",
    };
  }
};

export const checkUserOrDoctor: any = ({ set, jwt_payload, params }: any) => {
  console.log(jwt_payload.user_id + "   " + params.user_id);

  if (jwt_payload.role !== "Doctor" && !jwt_payload) {
    if (set.status) set.status = 401;
    return {
      msg: "unauthorized",
      error: "only doctor or patient can access this route",
    };
  }
};

export const checkUser: any = ({ set, jwt_payload, params }: any) => {
  if (jwt_payload.user_id !== params.user_id) {
    if (set.status) set.status = 401;
    return {
      msg: "unauthorized",
      error: "user not authorized",
    };
  }
};
