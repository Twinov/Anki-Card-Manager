<script lang='ts'>
  import 'smelte/src/tailwind.css'

  import { List, ListItem, NavigationDrawer } from 'smelte'
  import { Link } from 'svelte-routing'

  type menuType = { to: string; text: string }[]
  const menu: menuType = [
    { to: 'japanese', text: 'Japanese' },
    { to: 'chinese', text: 'Chinese' },
  ]
</script>

<NavigationDrawer elevation={true}>
  <h6>Decks</h6>
  <List items={menu}>
    <span slot='item' let:item class='cursor-pointer'>
      <Link to={item.to}>
        <ListItem selected={true} {...item} dense navigation />
      </Link>
    </span>
  </List>
</NavigationDrawer>

<style>

</style>