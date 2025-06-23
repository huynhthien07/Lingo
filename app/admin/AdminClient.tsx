"use client";

import { Admin, Resource } from "react-admin";
import { dataProvider } from "./dataProvider";
import { Box, CssBaseline, GlobalStyles } from "@mui/material";
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
  const { currentTheme, isDarkMode } = useTheme();

  const darkModeStyles = isDarkMode ? {
    'html, body, #root': {
      backgroundColor: '#121212 !important',
      color: '#ffffff !important',
    },
    '.RaLayout-root': {
      backgroundColor: '#121212 !important',
    },
    '.RaLayout-appFrame': {
      backgroundColor: '#121212 !important',
    },
    '.RaLayout-contentWithSidebar': {
      backgroundColor: '#121212 !important',
    },
    '.RaLayout-content': {
      backgroundColor: '#121212 !important',
    },
    '.RaSidebar-root .MuiDrawer-paper': {
      backgroundColor: '#1e1e1e !important',
      borderRight: '1px solid #333333 !important',
    },
    '.RaList-root': {
      backgroundColor: '#121212 !important',
    },
    '.RaList-main': {
      backgroundColor: '#1e1e1e !important',
    },
    '.RaDatagrid-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.RaDatagrid-table': {
      backgroundColor: '#1e1e1e !important',
    },
    '.RaDatagrid-headerRow': {
      backgroundColor: '#2d2d2d !important',
    },
    '.RaDatagrid-headerCell': {
      backgroundColor: '#2d2d2d !important',
      color: '#ffffff !important',
    },
    '.RaDatagrid-row': {
      backgroundColor: '#1e1e1e !important',
      '&:hover': {
        backgroundColor: '#333333 !important',
      },
    },
    '.RaDatagrid-rowCell': {
      borderBottom: '1px solid #333333 !important',
      color: '#ffffff !important',
    },
    '.MuiPaper-root': {
      backgroundColor: '#1e1e1e !important',
      color: '#ffffff !important',
    },
    '.MuiCard-root': {
      backgroundColor: '#2d2d2d !important',
      color: '#ffffff !important',
    },
    '.MuiTableContainer-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.MuiTable-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.MuiTableHead-root': {
      backgroundColor: '#2d2d2d !important',
    },
    '.MuiTableBody-root': {
      backgroundColor: '#1e1e1e !important',
    },
    '.MuiTableRow-root': {
      backgroundColor: '#1e1e1e !important',
      '&:hover': {
        backgroundColor: '#333333 !important',
      },
    },
    '.MuiTableCell-root': {
      borderBottom: '1px solid #333333 !important',
      color: '#ffffff !important',
    },
    '.MuiTableCell-head': {
      backgroundColor: '#2d2d2d !important',
      color: '#ffffff !important',
      fontWeight: 600,
    },
  } : {};

  return (
    <>
      <CssBaseline />
      <GlobalStyles styles={darkModeStyles} />
      <Box
        sx={{
          backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
          minHeight: '100vh',
          color: isDarkMode ? '#ffffff' : '#333333',
        }}
      >
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
      </Box>
    </>
  );
};

export default App;