"use client";

import {
    Edit,
    SimpleForm,
    TextInput,
    BooleanInput,
    NumberInput,
    ReferenceInput,
    SelectInput,
    required
} from "react-admin";

export const UserEdit = () => {
    return (
        <Edit>
            <SimpleForm>
                <TextInput
                    source="userId"
                    label="User ID"
                    disabled
                />
                <TextInput
                    source="userName"
                    validate={[required()]}
                    label="Name"
                />
                <TextInput
                    source="userImageSrc"
                    label="Avatar URL"
                />
                <ReferenceInput
                    source="activeCourseId"
                    reference="courses"
                    label="Active Course"
                >
                    <SelectInput optionText="title" />
                </ReferenceInput>
                <NumberInput
                    source="hearts"
                    label="Hearts"
                    min={0}
                    max={5}
                />
                <NumberInput
                    source="points"
                    label="Points"
                    min={0}
                />
                <BooleanInput
                    source="blocked"
                    label="Block User"
                    helperText="Blocked users cannot log in to the system"
                />
            </SimpleForm>
        </Edit>
    );
};
