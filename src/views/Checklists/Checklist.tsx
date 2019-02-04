import React, { ReactNode } from 'react';
import { withNamespaces, WithNamespaces } from 'react-i18next';

import ProgressBar from '../../components/ProgressBar';

interface ChecklistProps extends WithNamespaces {
  name: ReactNode,
  binding: ReactNode,
  progressDescription: ReactNode,
  totalItems: number,
  completedItems: number,
  children: ReactNode
}

const Checklist = (props: ChecklistProps) => {
  const { t, name, binding, totalItems, progressDescription, completedItems, children } = props;

  return (
    <>
      <div className='head'>
        <h4>{name}</h4>
        <div className='binding'>
          <p>{binding}</p>
        </div>
        <ProgressBar
          objectiveDefinition={{
            progressDescription,
            completionValue: totalItems
          }}
          playerProgress={{
            progress: completedItems
          }}
          hideCheck
          chunky
        />
      </div>
      {children ? (
        <ul className='list no-interaction'>{children}</ul>
      ) : (
        <div className='info'>
          <div className='text'>{t("You've completed this list.")}</div>
        </div>
      )}
    </>
  );
};

export default withNamespaces()(Checklist);
