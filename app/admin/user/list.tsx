"use client";

import {
    Datagrid,
    List,
    TextField,
    NumberField,
    BooleanField,
    ImageField,
    ReferenceField,
    FunctionField,
    ChipField
} from "react-admin";

export const UserList = () => {
    return (
        <List>
            <Datagrid rowClick="edit">
                <TextField source="userId" label="User ID" />
                <TextField source="userName" label="Name" />
                <ImageField source="userImageSrc" label="Avatar" />
                <ReferenceField
                    source="activeCourseId"
                    reference="courses"
                    label="Active Course"
                >
                    <TextField source="title" />
                </ReferenceField>
                <NumberField source="hearts" label="Hearts" />
                <NumberField source="points" label="Points" />
                <FunctionField
                    label="Status"
                    render={(record: any) => (
                        <ChipField
                            record={{ status: record.blocked ? "Blocked" : "Active" }}
                            source="status"
                            sx={{
                                backgroundColor: record.blocked ? "#f44336" : "#4caf50",
                                color: "white",
                            }}
                        />
                    )}
                />
                <BooleanField source="blocked" label="Blocked" />
            </Datagrid>
        </List>
    );
};
