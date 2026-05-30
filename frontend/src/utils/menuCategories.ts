const CATEGORY_LABELS: Record<string, { en: string; vi: string }> = {
  appetizer: { en: 'Appetizer', vi: 'Món khai vị' },
  appetizier: { en: 'Appetizer', vi: 'Món khai vị' },
  starter: { en: 'Starter', vi: 'Món khai vị' },
  salad: { en: 'Salad', vi: 'Salad' },
  soup: { en: 'Soup', vi: 'Súp' },
  main: { en: 'Main Course', vi: 'Món chính' },
  main_course: { en: 'Main Course', vi: 'Món chính' },
  'main course': { en: 'Main Course', vi: 'Món chính' },
  beef: { en: 'Beef', vi: 'Bò' },
  chicken: { en: 'Chicken', vi: 'Gà' },
  pork: { en: 'Pork', vi: 'Heo' },
  seafood: { en: 'Seafood', vi: 'Hải sản' },
  pasta: { en: 'Pasta', vi: 'Mì Ý' },
  rice: { en: 'Rice', vi: 'Cơm' },
  dessert: { en: 'Dessert', vi: 'Tráng miệng' },
  drink: { en: 'Drinks', vi: 'Đồ uống' },
  beverage: { en: 'Drinks', vi: 'Đồ uống' },
  coffee: { en: 'Coffee', vi: 'Cà phê' },
  tea: { en: 'Tea', vi: 'Trà' },
  alcoholic: { en: 'Alcoholic drinks', vi: 'Đồ uống có cồn' },
};

const normalizeCategoryKey = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

export const translateCategoryName = (name: string | undefined, language: string) => {
  if (!name) return '';

  const key = normalizeCategoryKey(name);
  const label = CATEGORY_LABELS[key];
  if (label) {
    return language === 'vi' ? label.vi : label.en;
  }

  return name;
};

