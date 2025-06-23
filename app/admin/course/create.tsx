import { Create, required, SimpleForm, TextInput } from "react-admin";
import { useAutoRefresh } from "../hooks/useAutoRefresh";

export const CourseCreate = () => {
    const { handleCreateSuccess, handleError } = useAutoRefresh();

    const onSuccess = (data: any) => {
        handleCreateSuccess('Course', data);
    };

    const onError = (error: any) => {
        handleError(error, 'course creation');
    };

    return (
        <Create mutationOptions={{ onSuccess, onError }}>
            <SimpleForm>
                <TextInput source="title" validate={[required()]} label="Title" />
                <TextInput source="imageSrc" validate={[required()]} label="Image" />
            </SimpleForm>
        </Create>
    )
}