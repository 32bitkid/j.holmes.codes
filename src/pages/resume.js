import React from 'react';

import unified from 'unified';
import parse from 'remark-parse';
import remark2react from 'remark-react';
import moment from 'moment';

import Layout from "../components/layout";
import resume from './resume.yaml';
import css from './resume.module.scss';
import ExternalLink from '../components/external-link';
import SEO from "../components/seo"

const defaultParser = unified()
  .use(parse)
  .use(remark2react);

const md = (text, parser = defaultParser) => (
    parser.processSync(text).contents
);

const Heading = ({ name, jobTitle, children }) => (
  <header className={css.heading}>
    <hgroup>
      <h1>{name}</h1>
      <h2>{jobTitle || 'Software Engineer'}</h2>
    </hgroup>
    { children }
  </header>
);

const AboutMe = ({ summary }) => (
  <section className={css.aboutMe}>
    {md(summary)}
  </section>
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
      <header className={css.exp__heading}>
        <span className={css.exp__title}>{exp.title}</span>
        {" "}&#x00B7;{" "}
        <span className={css.exp__company}>
          <ExternalLink href={exp.url}>{exp.company}</ExternalLink>
        </span>
      </header>
      <div className={css.exp__dates}>
        <Date date={exp.from}/>
        &ndash;
        <Date date={exp.to} fallback={<em>Present</em>}/>
      </div>
      <div className={css.exp__desc}>{ md(exp.description) }</div>
      <ul className={css.exp__stack}>
        {
          (exp.tech || [])
            .sort(skillSorter)
            .map(({name, experience}) => (
              <li
                key={name}
                className={[
                  css.exp__tech,
                  css[`exp__tech__${experience}`],
                ].join(' ')}
              >{name}</li>
            ))
        }
      </ul>
    </li>
  ));

  return (
    <section className={css.workExperience}>
      <h3>Experience</h3>
      <ol className={css.workExperience__list}>
        { experience.map(toItem) }
      </ol>
    </section>
  );
};

const Education = ({ education }) => {
  const toItem = (item) => (
    <li className={css.school} key={item.school}>
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
      <h3>Education</h3>
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
      <h3>Skills</h3>
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
      <h3>Software</h3>
      <ul>{software.map(toItem)}</ul>
    </section>
  );
};

const Projects = ({ projects = [] }) => {
  const toItem = ({ name, link, description, role = 'contributor' }) => (
    <li className={`${css.project} ${css[role]}`} key={name}>
      <div><ExternalLink href={link}>{name}</ExternalLink></div>
      <div className={css.project__description}>{md(description)}</div>
    </li>
  );

  return (
    <section className={css.projects}>
      <h3>Projects</h3>
      <ul>{projects.map(toItem)}</ul>
    </section>
  );
}

const skillSorter = (a, b) => {
  if (a.experience !== b.experience) return b.experience - a.experience;
  return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
}

export default () => (
  <Layout>
    <SEO title="My Resume" keywords={[`resume`]} />
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
        <Projects projects={resume.projects} />
      </div>
    </article>
  </Layout>
);