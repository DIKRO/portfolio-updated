import type { Project } from "@/types/project";

// Единый порядок проектов для галереи (WorkGrid) и для «Следующий проект» на
// странице кейса — чтобы кнопка «дальше» вела именно туда, где человек видел
// следующую карточку.
//
// useFeatured — только для общего списка «Все»: проекты с featuredOrder идут
// первыми (по возрастанию featuredOrder), остальные — после них, по order.
// В отдельных категориях закрепление не применяется, там порядок только по
// order.
export function sortProjects(list: Project[], { useFeatured }: { useFeatured: boolean }): Project[] {
  return list.slice().sort((a, b) => {
    if (useFeatured) {
      const fa = a.featuredOrder ?? Infinity;
      const fb = b.featuredOrder ?? Infinity;
      if (fa !== fb) return fa < fb ? -1 : 1;
    }
    return a.order - b.order;
  });
}
