"use client";

import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { ChallengeCreate } from "./challenge/create";
import { ChallengeEdit } from "./challenge/edit";
import { ChallengeList } from "./challenge/list";
import { ChallengeOptionCreate } from "./challengeOption/create";
import { ChallengeOptionEdit } from "./challengeOption/edit";
import { ChallengeOptionList } from "./challengeOption/list";
import { CourseCreate } from "./course/create";
import { CourseEdit } from "./course/edit";
import { CourseList } from "./course/list";
import { LessonCreate } from "./lesson/create";
import { LessonEdit } from "./lesson/edit";
import { LessonList } from "./lesson/list";
import { UnitCreate } from "./unit/create";
import { UnitEdit } from "./unit/edit";
import { UnitList } from "./unit/list";
import { UserEdit } from "./user/edit";
import { UserList } from "./user/list";
import { StatisticsList } from "./statistics/list";
import { CustomLayout } from "./layout/CustomLayout";
import { Dashboard } from "./dashboard/Dashboard";
import { SearchTest } from "./debug/search-test";
import { AdminThemeProvider, useTheme } from "./context/ThemeContext";

const App = () => {
  return (
    <AdminThemeProvider>
      <AdminContent />
    </AdminThemeProvider>
  );
};

const AdminContent = () => {
  const { currentTheme } = useTheme();

  return (
    <Admin
      dataProvider={dataProvider}
      theme={currentTheme}
      layout={CustomLayout}
      dashboard={Dashboard}
      title="Lingo Admin Dashboard"
    >
      <Resource
        name="courses"
        list={CourseList}
        create={CourseCreate}
        edit={CourseEdit}
        recordRepresentation="title"
        options={{ label: "📚 Courses" }}
      />
      <Resource
        name="units"
        list={UnitList}
        create={UnitCreate}
        edit={UnitEdit}
        recordRepresentation="title"
        options={{ label: "📖 Units" }}
      />
      <Resource
        name="lessons"
        list={LessonList}
        create={LessonCreate}
        edit={LessonEdit}
        recordRepresentation="title"
        options={{ label: "📝 Lessons" }}
      />
      <Resource
        name="challenges"
        list={ChallengeList}
        create={ChallengeCreate}
        edit={ChallengeEdit}
        recordRepresentation="question"
        options={{ label: "🎯 Challenges" }}
      />
      <Resource
        name="challengeOptions"
        list={ChallengeOptionList}
        create={ChallengeOptionCreate}
        edit={ChallengeOptionEdit}
        recordRepresentation="text"
        options={{ label: "🔘 Challenge Options" }}
      />
      <Resource
        name="users"
        list={UserList}
        edit={UserEdit}
        recordRepresentation="userName"
        options={{ label: "👥 Users" }}
      />
      <Resource
        name="statistics"
        list={StatisticsList}
        options={{ label: "📊 Statistics" }}
      />
      <Resource
        name="search-test"
        list={SearchTest}
        options={{ label: "🔍 Search Test" }}
      />
    </Admin>
  );
};

export default App;