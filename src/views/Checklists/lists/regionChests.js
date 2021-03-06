import React from 'react';
import cx from 'classnames';
import orderBy from 'lodash/orderBy';

const regionChests = parent => {
  let props = parent.props;

  let characterProgressions = props.response.profile.characterProgressions.data;
  let characterId = props.characterId;

  let manifest = props.manifest;

  let list = [];

  Object.entries(characterProgressions[characterId].checklists[1697465175]).forEach(([key, value]) => {
    let hash = parseInt(key, 10);

    let completed = value;

    let checklist = false;
    Object.entries(manifest.DestinyChecklistDefinition[1697465175].entries).forEach(([pear, peach]) => {
      if (manifest.DestinyChecklistDefinition[1697465175].entries[pear].hash === hash) {
        checklist = manifest.DestinyChecklistDefinition[1697465175].entries[pear];
        return;
      }
    });

    let destination = false;
    Object.keys(manifest.DestinyDestinationDefinition).forEach(subKey => {
      if (manifest.DestinyDestinationDefinition[subKey].hash === checklist.destinationHash) {
        destination = manifest.DestinyDestinationDefinition[subKey];
        return;
      }
    });

    let place = false;
    Object.keys(manifest.DestinyPlaceDefinition).forEach(subKey => {
      if (manifest.DestinyPlaceDefinition[subKey].hash === destination.placeHash) {
        place = manifest.DestinyPlaceDefinition[subKey];
        return;
      }
    });

    let regionchest = false;
    Object.keys(destination.bubbles).forEach(subKey => {
      if (destination.bubbles[subKey].hash === checklist.bubbleHash) {
        regionchest = destination.bubbles[subKey];
        return;
      }
    });

    list.push({
      completed: completed ? 1 : 0,
      place: place.displayProperties.name,
      name: regionchest ? regionchest.displayProperties.name : `???`,
      element: (
        <li key={checklist.hash}>
          <div
            className={cx('state', {
              completed: completed
            })}
          />
          <div className='text'>
            <p>{regionchest ? regionchest.displayProperties.name : `???`}</p>
            <p>{place.displayProperties.name}</p>
          </div>
          <div className='lowlines'>
            <a href={`https://lowlidev.com.au/destiny/maps/${checklist.destinationHash}/${checklist.hash}?origin=BRAYTECH`} target='_blank' rel='noopener noreferrer'>
              <i className='uniE1C4' />
            </a>
          </div>
        </li>
      )
    });
  });

  list = orderBy(list, [item => item.completed, item => item.place, item => item.name], ['asc', 'asc', 'asc']);

  return list;
};

export default regionChests;
