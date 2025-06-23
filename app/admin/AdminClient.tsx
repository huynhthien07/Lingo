"use client";

import simpleRestProvider from "ra-data-simple-rest";
import { Admin, Resource, defaultTheme } from "react-admin";
import { createTheme } from "@mui/material/styles";
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

// Custom theme with modern colors
const customTheme = createTheme({
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    ...defaultTheme.typography,
    h6: {
      fontWeight: 600,
    },
  },
  components: {
    ...defaultTheme.components,
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#1976d2',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          borderRadius: '8px',
        },
      },
    },
  },
});

const dataProvider = simpleRestProvider("/api");

const App = () => {
  return (
    <Admin
      dataProvider={dataProvider}
      theme={customTheme}
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
    </Admin>
  );

};

export default App;