"use client";

import {
    Edit,
    SimpleForm,
    TextInput,

    NumberInput,
    ReferenceInput,
    SelectInput,
    required,
    useNotify,
    useRefresh,
    useRedirect,

} from "react-admin";

// Admin user IDs that cannot be blocked
const adminIds = [
    "user_2tkC1z5zJJ4Sw2b85JXWEqmNeuY",
];



export const UserEdit = () => {
    const notify = useNotify();
    const refresh = useRefresh();
    const redirect = useRedirect();

    const onSuccess = (data: any) => {
        console.log('✅ User update successful:', data);
        notify('User updated successfully', { type: 'success' });
        refresh();
    };

    const onError = (error: any) => {
        console.error('❌ User update error:', error);
        notify('Error updating user', { type: 'error' });
    };

    return (
        <Edit mutationOptions={{ onSuccess, onError }}>
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
            </SimpleForm>
        </Edit>
    );
};
