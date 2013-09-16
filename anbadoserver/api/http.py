#!/usr/bin/env python
# -*- coding: utf-8 -*-
from flask import (
    request,
    abort
    )

from flask.views import MethodView
from sqlalchemy.exc import SQLAlchemyError
from anbadoserver.models import (
    User,
    Video
    )
from anbadoserver import db
from anbadoserver.jsonifier import jsonify


class UserAPI(MethodView):
    def get(self, user_id):
        user = User.by_user_id(user_id)
        if user is None:
            abort(404)

        return jsonify(user=user)

    def post(self):
        profile_image = request.form.get('profile_image', None)
        if profile_image is None:
            abort(400)

        user = User(profile_image)
        if not user.save():
            abort(500)

        return jsonify(success=True, user_id=user.user_id)


    def put(self, user_id):
        profile_image = request.form.get('profile_image', None)
        if profile_image is None:
            abort(400)

        user = User.by_user_id(user_id)
        if user is None:
            abort(404)

        user.profile_image = profile_image
        if not user.save():
            abort(500)

        return jsonify(success=True)


class VideoAPI(MethodView):
    def get(self, video_id):
        video = Video.by_video_id(video_id)
        if video is None:
            abort(404)

        return jsonify(video=video)

    def post(self):
        provider = request.form.get('provider', None)
        provider_vid = request.form.get('provider_vid', None)
        title = request.form.get('title', '')
        length = request.form.get('length', None)
        user_id = request.form.get('user_id', None)

        if (provider is None) or (provider_vid is None) or (length is None) or (user_id is None):
            abort(400)

        user = User.by_user_id(user_id)
        if user is None:
            abort(400)

        video = Video(provider, provider_vid, title, length, user)
        if not video.save():
            abort(500)

        return jsonify(success=True, video_id=video.video_id)

    def put(self, video_id):
        video = Video.by_video_id(video_id)
        if video is None:
            abort(404)

        if 'video_id' in request.form:
            abort(400)

        for key in request.form.keys():
            if key == 'user_id':
                user = User.by_user_id(request.form[key])
                video.user = user

            setattr(video, key, request.form[key])

        if not video.save():
            abort(500)

        return jsonify(success=True)


class ParticipantsAPI(MethodView):
    def get(self, video_id):
        video = Video.by_video_id(video_id)
        if video is None:
            abort(404)

        return jsonify(participants=video.participants.all())


class FriendshipAPI(MethodView):
    def get(self, user_id):
        user = User.by_user_id(user_id)
        if user is None:
            abort(404)

        return jsonify(friends=user.friends.all())

    def post(self, userA_id, userB_id):
        userA = User.by_user_id(userA_id)
        userB = User.by_user_id(userB_id)

        if (userA is None) or (userB is None):
            abort(404)

        userA.friends.append(userB)
        userB.friends.append(userA)

        if userA.save(commit=False) and userB.save(commit=False):
            try:
                db.session.commit()
                return jsonify(success=True)
            except SQLAlchemyError:
                db.session.rollback()
                abort(500)

        abort(500)

    def delete(self, userA_id, userB_id):
        userA = User.by_user_id(userA_id)
        userB = User.by_user_id(userB_id)

        if (userA is None) or (userB is None):
            abort(404)

        userA.friends.remove(userB)
        userB.friends.remove(userA)

        if userA.save(commit=False) and userB.save(commit=False):
            try:
                db.session.commit()
                return jsonify(success=True)
            except SQLAlchemyError:
                db.session.rollback()
                abort(500)

        abort(500)
