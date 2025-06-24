import { Create, NumberInput, ReferenceInput, required, SelectInput, SimpleForm, TextInput } from "react-admin";

export const ChallengeCreate = () => {
    return (
        <Create>
            <SimpleForm>
                <TextInput
                    source="question"
                    validate={[required()]}
                    label="Question"
                />

                <SelectInput
                    source="type"
                    choices={[
                        {
                            id: "SELECT",
                            name: "Multiple Choice",
                        },
                        {
                            id: "ASSIST",
                            name: "Assisted Learning",
                        },
                        {
                            id: "GRAMMAR",
                            name: "Grammar Exercise",
                        },
                        {
                            id: "VOCABULARY",
                            name: "Vocabulary Practice",
                        },
                        {
                            id: "LISTENING",
                            name: "Listening Comprehension",
                        },
                        {
                            id: "READING",
                            name: "Reading Comprehension",
                        }
                    ]}
                    validate={[required()]}
                />

                <ReferenceInput
                    source="lessonId"
                    reference="lessons"
                    label="Lesson"
                    sort={{ field: 'id', order: 'DESC' }}
                    perPage={100}
                >
                    <SelectInput optionText="title" validate={[required()]} />
                </ReferenceInput>
                <NumberInput
                    source="order"
                    validate={[required()]}
                    label="Order"
                />
            </SimpleForm>
        </Create>
    )
}