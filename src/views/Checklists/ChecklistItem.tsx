import React, { ReactNode } from 'react';
import cx from 'classnames';

interface ChecklistItemProps {
  completed: boolean;
  children: ReactNode;
  mapPath?: string | undefined;
}

const ChecklistItem = (props: ChecklistItemProps) => {
  const { completed, children, mapPath } = props;

  return (
    <li>
      <div className={cx('state', { completed })} />
      {children}
      {mapPath && (
        <div className='lowlines'>
          <a href={`https://lowlidev.com.au/${mapPath}?origin=BRAYTECH`} target='_blank' rel='noopener noreferrer'>
            <i className='uniE1C4' />
          </a>
        </div>
      )}
    </li>
  );
};

export default ChecklistItem;
