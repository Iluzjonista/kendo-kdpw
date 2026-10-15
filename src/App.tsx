import type { ReactElement } from 'react';
import { fetchPosts, type HnPost } from './api/hackerNews';
import { GridWrapper, type FilterOption, type GridColumnConfig } from './components/GridWrapper';
import { getRowTone } from './utils/rowTone';

const TYPE_OPTIONS: readonly FilterOption[] = [
  { text: 'Show HN', value: 'show_hn' },
  { text: 'Ask HN', value: 'ask_hn' },
  { text: 'Story', value: 'story' },
];

const COLUMNS: readonly GridColumnConfig<HnPost>[] = [
  { field: 'type', title: 'Type', width: 130, filter: { type: 'dropdown', options: TYPE_OPTIONS } },
  { field: 'title', title: 'Title', filter: { type: 'text' } },
  { field: 'author', title: 'Author', width: 180, filter: { type: 'text' } },
  { field: 'points', title: 'Points', width: 110, filter: { type: 'number' } },
  { field: 'comments', title: 'Comments', width: 120, filter: { type: 'number' } },
];

function App(): ReactElement {
  return (
    <main>
      <GridWrapper<HnPost>
        title="Hacker News"
        columns={COLUMNS}
        idField="id"
        fetchData={fetchPosts}
        pageSize={10}
        getRowTone={getRowTone}
      />
    </main>
  );
}

export default App;