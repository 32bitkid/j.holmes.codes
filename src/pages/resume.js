import React from 'react';

import unified from 'unified';
import parse from 'remark-parse';
import remark2react from 'remark-react';
import moment from 'moment';

import Layout from "../components/layout";
import resume from './resume.yaml';
import css from './resume.module.scss';
import ExternalLink from '../components/external-link';

const defaultParser = unified()
  .use(parse)
  .use(remark2react);

const md = (text, parser = defaultParser) => (
    parser.processSync(text).contents
);

const Contacts = ({ links }) => {
  const toItem = ([type, link]) => (
    <li className={css[`contacts_${type}`]} key={type}>
      <ExternalLink href={link}>{link}</ExternalLink>
    </li>
  );

  return (
    <ul className={css.contacts}>{ Object.entries(links).map(toItem) }</ul>
  );
};

const Date = ({ date, fallback, short }) => (
  date ? moment(date, 'YYYY-MM').format( short ? 'YYYY' : "MMM YYYY") : fallback
);

const WorkExperience = ({ experience }) => {
  const toItem = (exp => (
    <li className={css.exp} key={exp.company}>
      <heading className={css.exp__heading}>
        <span className={css.exp__title}>{exp.title}</span>
        {" "}&#x00B7;{" "}
        <span className={css.exp__company}>
        <ExternalLink href={exp.url}>{exp.company}</ExternalLink>
      </span>
      </heading>
      <div className={css.exp__dates}>
        <Date date={exp.from}/>
        &ndash;
        <Date date={exp.to} fallback={<em>Present</em>}/>
      </div>
      <div className={css.exp__desc}>{ md(exp.description) }</div>
    </li>
  ));

  return (
    <section className={css.workExperience}>
      <h5>Experience</h5>
      <ol className={css.workExperience__list}>
        { experience.map(toItem) }
      </ol>
    </section>
  );
};

const AboutMe = ({ summary }) => (
  <section className={css.aboutMe}>
    {md(summary)}
  </section>
);

const Heading = ({ name, jobTitle, children }) => (
  <heading className={css.heading}>
    <hgroup>
      <h1>{name}</h1>
      <h2>{jobTitle || 'Software Engineer'}</h2>
    </hgroup>
    { children }
  </heading>
);

const Education = ({ education }) => {
  const toItem = (item) => (
    <li className={css.school}>
      <div className={css.school__name}>{item.school}</div>
      <div className={css.school__program}>{item.program}</div>
      <div className={css.school__dates}>
        <Date date={item.from} short={true}/>
        &ndash;
        <Date date={item.to} short={true} fallback={<em>Present</em>}/>
      </div>
    </li>
  );
  return (
    <section className={css.education}>
      <h5>Education</h5>
      <ul>{ education.map(toItem) }</ul>
    </section>
  );
};

const Skills = ({ skills }) => {
  const toItem = ({name, experience}) => (
    <li
      key={name}
      className={[css.skill, css[`skill__${experience}`]].join(' ')}
    >{name}</li>
  );

  return (
    <section className={css.skills}>
      <h5>Skills</h5>
      <ul>{skills.map(toItem)}</ul>
    </section>
  );
};

const Software = ({ software }) => {
  const toItem = ({name}) => (
    <li key={name}>{name}</li>
  );

  return (
    <section className={css.software}>
      <h5>Software</h5>
      <ul>{software.map(toItem)}</ul>
    </section>
  );
};

const skillSorter = (a, b) => {
  if (a.experience !== b.experience) return b.experience - a.experience;
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

export default () => (
  <Layout>
    <article className={css.resume}>
      <Heading name={resume.name} jobTitle={resume.jobTitle}>
        <Contacts links={resume.links} />
      </Heading>
      <AboutMe summary={resume.summary}/>
      <div className={css.details}>
        <WorkExperience experience={resume.workExperience} />
        <Education education={resume.education} />
        <Skills
          skills={resume.technicalExperience
            .filter(s => s.featured)
            .sort(skillSorter)
          }
        />
        <Software
          software={resume.software
            .filter(s => s.featured )
            .sort(skillSorter)
          }
        />
      </div>
    </article>
  </Layout>
);