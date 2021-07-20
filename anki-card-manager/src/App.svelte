<script lang="ts">
  import 'smelte/src/tailwind.css'

  import {
    List,
    ListItem,
    NavigationDrawer
  } from 'smelte'

  const menu = [
    { to: 'Japanese', text: 'Japanese'},
    { to: 'Chinese', text: 'Chinese'}
  ]
</script>

<NavigationDrawer>
  <h6>Decks</h6>
  <List items={menu}>
    <span slot='item' let:item={item} class='cursor-pointer'>
      <a href={'item.to'}>
        <ListItem
          selected={true}
          {...item}
          dense
          navigation
        />
      </a>
    </span>
  </List>
</NavigationDrawer>


<style global>
  @tailwind base;
  @tailwind components;
  @tailwind utilities
</style>