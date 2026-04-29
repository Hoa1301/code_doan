import { Navigate, useParams } from 'react-router-dom';
import { RouteConfig } from '../../../constants';

export const MentorEvalPhase1Redirect = () => {
    const { id } = useParams<{ id: string }>();

    if (!id) {
        return <Navigate replace to={RouteConfig.MentorInternList.path} />;
    }

    return <Navigate replace to={RouteConfig.MentorEvaluation.getPath(id)} />;
};
