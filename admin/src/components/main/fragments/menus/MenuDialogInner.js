import React, { Component } from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import AddIcon from '@material-ui/icons/Add';

import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import Paper from '@material-ui/core/Paper';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import teal from '@material-ui/core/colors/teal';
import indigo from '@material-ui/core/colors/indigo';

import * as R from 'ramda';

const menu_item_styles = theme => ({
  text_field: {
    width: '100%',
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  addBtnWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-end',
  },
  button: {
    margin: 10
  },

  root: {
    width: '100%',
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
  },
  list: {
    padding: 0,
    listStyleType: 'none',
    padding: 20,
    marginBottom: 20
  },

  expansionPanel: {
    marginTop: 20,
    marginBottom: 20,
  },

  expansionPanelDetails: {
    display: 'block'
  },

  textFieldsWrapper: {
    padding: 20,
    marginBottom: 20
  }
});


class MenuItemUnstyled extends Component {
  // check if all path elements cover current_path elements
  isOnPath(path, current_path) {
    let on_path = true;

    path.forEach((item, i) => {
      if (item !== current_path[i]) {
        on_path = false;
      }
    });

    return on_path;
  }

  renderInnerList() {
    const {
      item,
      classes,
      current_index_path,
      updatePath,
      updateMenuData,
      index_path
    } = this.props;

    if (item.items) {
      return (
        <Paper component='ul' className={classes.list}>
          {item.items.map((item, i) => (
            <MenuItemUnstyled
              key={i}
              item={item}
              classes={classes}
              updatePath={updatePath}
              current_index_path={current_index_path}
              updateMenuData={updateMenuData}
              index_path={[...index_path, i]}
            />
          ))}
        </Paper>
      );
    }

    return null;
  }

  onExpandChange = () => {
    const { index_path, current_index_path } = this.props;

    if (R.equals(index_path, current_index_path)) {
      const new_path = [...current_index_path];

      // go one level lower when already expanded element is clicked again
      new_path.pop();

      this.props.updatePath(new_path);
    } else {
      this.props.updatePath(index_path);
    }
  }

  render() {
    const { item, classes, updateMenuData, index_path, current_index_path } = this.props;
    const name = item.name;
    const href = item.href || '';

    // check if the path of the element is on the path of the topmost expanded element
    // makes sure that the parent is not closed while its descandant is currently expanded
    const on_path = this.isOnPath(index_path, current_index_path);

    return (
      <li>
        <ExpansionPanel
          // darkens the color depending on how deeply nested the element is
          style={{ backgroundColor: indigo[100 * index_path.length] }}
          className={classes.expansionPanel}
          expanded={on_path}
          onChange={() => this.onExpandChange()}
        >
          <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
            <Typography className={classes.heading}>{name}</Typography>
          </ExpansionPanelSummary>
          <ExpansionPanelDetails className={classes.expansionPanelDetails}>
            <Paper className={classes.textFieldsWrapper}>
              <TextField
                label='Name'
                value={name}
                onChange={e => updateMenuData(index_path, 'name', e.target.value)}
                margin='normal'
                className={classes.text_field}
              />
              <TextField
                label='Url'
                value={href}
                onChange={e => updateMenuData(index_path, 'href', e.target.value)}
                margin='normal'
                className={classes.text_field}
              />
            </Paper>

            {this.renderInnerList()}

            {
              // if depth greater than 4 do not allow adding more nested lists
              index_path.length < 4
                ? (
                  <div className={classes.addBtnWrapper}>
                    <Button color="primary" variant="fab" aria-label="Add" className={classes.button} mini>
                      <AddIcon />
                    </Button>
                  </div>
                ) : null
            }
          </ExpansionPanelDetails>
        </ExpansionPanel>
      </li>
    );
  }
}

const MenuItem = withStyles(menu_item_styles)(MenuItemUnstyled);



class MenuDialogInner extends Component {
  state = {
    menu_data: null,
    menu_path: [],
    menu_index_path: []
  }

  updatePath = menu_index_path => {
    this.setState({ menu_index_path });
  }

  updateMenuData = (path, prop_name, value) => {

    // prepares lenses path for the item being edited and updates it
    const menu_data = R.pipe(
      R.intersperse('items'),
      R.prepend('items'),
      R.append(prop_name),
      R.assocPath(R.__, value, this.state.menu_data || this.props.data)
    )(path);

    this.setState({ menu_data });
  }

  renderItems() {
    const data = this.state.menu_data || this.props.data || {};

    // converts an object of menu items into an array
    const menu_items = Object.keys(data.items).map(item => data.items[item]);

    return menu_items.map((item, i) => (
      <MenuItem
        item={item}
        key={i}
        current_index_path={this.state.menu_index_path}
        updatePath={this.updatePath}
        updateMenuData={this.updateMenuData}
        index_path={[i]}
      />
    ));
  }

  render() {
    const data = this.state.menu_data || this.props.data;
    const { classes } = this.props;

    return (
      <div>
        <ul className={classes.list}>
          {this.renderItems()}
        </ul>
        <div className={classes.addBtnWrapper}>
          <Button color="primary" variant="fab" aria-label="Add" className={classes.button} mini>
            <AddIcon />
          </Button>
        </div>
      </div>
    )
  }

}

export default withStyles(menu_item_styles)(MenuDialogInner);