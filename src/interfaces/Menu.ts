interface WeeklyMenu {
    days: Menu[];
  }

  interface Menu {
    date: string,
    courses: Course[],
  }

  interface Course {
    price: string;
    name: string;
    diets: string[];
  }

  export type {Menu, WeeklyMenu}
