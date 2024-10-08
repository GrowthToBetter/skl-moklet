"use server";

import {
  Class,
  Gender,
  Prisma,
  Religion,
  RequestStatus,
  Role,
  Status,
  Task,
  Title,
  User,
} from "@prisma/client";
import prisma from "@/lib/prisma";
import {
  createDetailUser,
  createTaskUser,
  createUser,
  findTaskIdWithName,
  findUser,
  updateUser,
} from "../user.query";
import { revalidatePath } from "next/cache";
import { nextGetServerSession } from "@/lib/authOption";
import { useRouter } from "next/navigation";

export const UpdateUserById = async (data: FormData) => {
  try {
    const session = await nextGetServerSession();

    const id = session?.user?.id;

    const email = data.get("email") as string;
    const photo_profile = data.get("photo_profile") as string;
    const name = data.get("name") as string;
    const role = data.get("role") as Role;
    const clasess = data.get("clasess") as Class;
    const absent = data.get("absent") as string;
    const Phone = data.get("Phone") as string;
    const NIS = data.get("NIS") as string;
    const NISN = data.get("NISN") as string;
    const schoolOrigin = data.get("schoolOrigin") as string;
    const status = data.get("status") as Status;
    const BirthDate = data.get("BirthDate") as string;
    const religion = data.get("religion") as Religion;
    const title = data.get("specialist") as Title;
    const gender = data.get("gender") as Gender;
    if (!id) {
      const create = await createUser({
        email,
        photo_profile,
        name,
        role,
        clasess,
        absent,
        NIS,
        NISN,
        Phone,
        schoolOrigin,
        status,
        title,
        BirthDate,
        religion,
        gender,
      });
      if (!create) throw new Error("Failed to create");
    } else if (id) {
      const findUserWithId = await prisma.user.findUnique({
        where: { id },
      });
      const update = await updateUser(
        { id: id ?? findUserWithId?.id },
        {
          email: email ?? findUserWithId?.email,
          name: name ?? findUserWithId?.name,
          absent: absent ?? findUserWithId?.absent,
          clasess: clasess ?? findUserWithId?.clasess,
          NIS: NIS ?? findUserWithId?.NIS,
          NISN: NISN ?? findUserWithId?.NISN,
          schoolOrigin: schoolOrigin ?? findUserWithId?.schoolOrigin,
          Phone: Phone ?? findUserWithId?.Phone,
          BirthDate: BirthDate ?? findUserWithId?.BirthDate,
          gender: gender ?? findUserWithId?.gender,
          role: role ?? findUserWithId?.role,
          title: title ?? findUserWithId?.title,
          status: status ?? findUserWithId?.status,
          photo_profile: photo_profile ?? findUserWithId?.photo_profile,
          religion: religion ?? findUserWithId?.religion,
        }
      );
      if (!update) throw new Error("Update failed");
    } else {
      throw new Error("Email already exists");
    }
    revalidatePath("/profile");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

export const UpdateTaskUserAuth = async (
  data: FormData,
  taskTeacherData: { connect: { id: string }[] },
  userConnect: { connect: { id: string } }
) => {
  const session = await nextGetServerSession();
  const Task = data.get("Task") as string;
  const userId = userConnect.connect.id;
  const classes = data.get("classes") as Class;
  const title = data.get("title") as Title;
  const Detail = data.get("Detail") as string;
  try {
    const create = await createTaskUser({
      Task,
      task: taskTeacherData,
      userId,
      classes,
      title,
    });
    if (Detail) {
      if (create.id) {
        const createDetail = await createDetailUser({
          Detail,
          idTask: create.id,
          status: "PENDING",
          teacherAuth: false,
          userAuthTask: false,
        });
        revalidatePath("/checklist");
        revalidatePath("/api/data");
        revalidatePath("/api/teacher");
        revalidatePath("/api/user");
        return { task: create, detail: createDetail };
      } else {
        throw new Error("Failed to create task");
      }
    } else {
      revalidatePath("/checklist");
      revalidatePath("/api/data");
      revalidatePath("/api/teacher");
      revalidatePath("/api/user");
      return { task: create };
    }
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const updateIdentity = async (id: string, data: FormData) => {
  try {
    const session = await nextGetServerSession();
    if (!session) {
      throw new Error("eror");
    }

    const clasess = data.get("Class") as Class;
    const Title = data.get("Specialist") as Title;
    const update = await prisma.user.update({
      where: { id: id },
      data: {
        clasess,
        title: Title,
      },
    });
    if (!update) {
      throw new Error("eror");
    }
    revalidatePath("/admin/studentData");
    revalidatePath("/checklist");
    revalidatePath("/profile");
    revalidatePath("/signin");
    revalidatePath("/api/teacher");
    revalidatePath("/api/data");
    revalidatePath("/api/siswa");
    return update;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const updateUserDetailTask = async (
  Detail: string,
  TaskConnect: { connect: { id: string } }
) => {
  const idTask = TaskConnect.connect.id;
  try {
    const create = await createDetailUser({
      Detail,
      idTask,
      status: "PENDING",
      teacherAuth: false,
      userAuthTask: false,
    });
    revalidatePath("/checklist");
    revalidatePath("/api/data");
    revalidatePath("/api/teacher");
    revalidatePath("/api/user");
    return create;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const updateTeacherOnUser = async (id: string, teacherId: string) => {
  try {
    const session = await nextGetServerSession();
    if (!session) {
      throw new Error("eror");
    }
    const update = await prisma.user.update({
      where: { id: id },
      data: {
        Teacher: {
          connect: {
            id: teacherId,
          },
        },
      },
    });
    if (!update) {
      throw new Error("eror");
    }
    revalidatePath("/admin/studentData");
    revalidatePath("/checklist");
    revalidatePath("/profile");
    revalidatePath("/signin");
    revalidatePath("/api/teacher");
    revalidatePath("/api/data");
    revalidatePath("/api/siswa");
    return update;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const updateRole = async (id: string, data: FormData) => {
  try {
    const session = await nextGetServerSession();
    if (!session) {
      throw new Error("eror");
    }

    const role = data.get("role") as Role;
    const update = await prisma.user.update({
      where: { id: id },
      data: {
        role,
      },
    });
    if (!update) {
      throw new Error("eror");
    }
    revalidatePath("/admin/studentData");
    revalidatePath("/pilihRole");
    return update;
  } catch (error) {
    throw new Error((error as Error).message);
  }
};

export const UpdateTaskUser = async (
  status: RequestStatus,
  detailId: string,
  data: FormData
) => {
  try {
    const session = await nextGetServerSession();
    if (!session) {
      throw new Error("Error while getting session");
    }
    const userAuthTask = data.get("userAuthTask") === "on";

    const update = await prisma.detail.update({
      where: { id: detailId },
      data: {
        userAuthTask: userAuthTask,
        status,
      },
    });

    if (!update) {
      throw new Error("Error while updating data");
    }
    revalidatePath("/checklist");
    revalidatePath("/");
    return update;
  } catch (err) {
    console.error(err);
    throw new Error((err as Error).message);
  }
};

export const UpdateTaskTeacher = async (
  status: RequestStatus,
  detailId: string,
  data: FormData
) => {
  try {
    const session = await nextGetServerSession();
    if (!session) {
      throw new Error("Error while getting session");
    }
    const teacherAuth = data.get("teacherAuth") === "on";

    const update = await prisma.detail.update({
      where: { id: detailId },
      data: {
        teacherAuth: teacherAuth,
        status,
      },
    });

    if (!update) {
      throw new Error("Error while updating data");
    }
    revalidatePath("/checklist");
    revalidatePath("/");
    return update;
  } catch (err) {
    console.error(err);
    throw new Error((err as Error).message);
  }
};

export const UpdateGeneralProfileById = async (data: FormData) => {
  try {
    const session = await nextGetServerSession();

    const id = session?.user?.id;

    const email = data.get("email") as string;
    const photo_profile = data.get("photo_profile") as string;
    const name = data.get("name") as string;
    const role = data.get("role") as Role;
    const clasess = data.get("clasess") as Class;
    const absent = data.get("absent") as string;
    const Phone = data.get("Phone") as string;
    const ClassNumber = data.get("classDetail") as string;
    const NIS = data.get("NIS") as string;
    const NISN = data.get("NISN") as string;
    const schoolOrigin = data.get("schoolOrigin") as string;
    const status = data.get("status") as Status;
    const BirthDate = data.get("BirthDate") as string;
    const religion = data.get("religion") as Religion;
    const gender = data.get("gender") as Gender;

    if (!id) {
      const create = await createUser({
        email,
        photo_profile,
        name,
        role,
        clasess,
        absent,
        NIS,
        NISN,
        ClassNumber,
        Phone,
        schoolOrigin,
        status,
        BirthDate,
        religion,
        gender,
      });
      if (!create) throw new Error("Failed to create");
    } else if (id) {
      const findUserWithId = await prisma.user.findUnique({
        where: { id },
      });

      const update = await updateUser(
        { id: id ?? findUserWithId?.id },
        {
          email: email ?? findUserWithId?.email,
          name: name ?? findUserWithId?.name,
          absent: absent ?? findUserWithId?.absent,
          clasess: clasess ?? findUserWithId?.clasess,
          ClassNumber: ClassNumber ?? findUserWithId?.ClassNumber,
          NIS: NIS ?? findUserWithId?.NIS,
          NISN: NISN ?? findUserWithId?.NISN,
          schoolOrigin: schoolOrigin ?? findUserWithId?.schoolOrigin,
          Phone: Phone ?? findUserWithId?.Phone,
          BirthDate: BirthDate ?? findUserWithId?.BirthDate,
          role: role ?? findUserWithId?.role,
          status: status ?? findUserWithId?.status,
          photo_profile: photo_profile ?? findUserWithId?.photo_profile,
          religion: religion ?? findUserWithId?.religion,
        }
      );
      if (!update) throw new Error("Update failed");
    } else {
      throw new Error("Email already exists");
    }
    revalidatePath("/profile");
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};
